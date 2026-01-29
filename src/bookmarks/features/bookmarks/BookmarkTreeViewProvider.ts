import * as vscode from 'vscode'
import { bookmarkIcon } from '../../../util/BookmarkIcon'
import { Commands } from '../../../util/constants/Commands'
import { fileHelper } from '../../../util/FileHelper'
import { Helper } from '../../../util/Helper'
import { logger } from '../../../util/LoggerHelper'
import { IconSymbol, iconSymbolQuickPick } from '../../../util/quick_pick_icon/IconSymbol'
import { Bookmark, CursorIndex } from '../../data/model/Bookmark'
import { LinePath } from '../../data/model/LinePath'
import { SetBookmark } from '../../data/model/SetBookmark'
import { bookmarkRepository } from '../../data/repository/BookmarksTreeRepository'
import { TreeModeBookmark } from '../../data/shared_data/TreeMode'
import path = require('path')
import { WatcherTreeViewProvider } from '../watchers/WatcherTreeViewProvider'
import { ContextBookmark } from '../../../util/ContextValue'
import { Config, StorageMode } from '../../data/shared_data/Config'

export class BookmarksTreeViewProvider implements vscode.TreeDataProvider<Bookmark>, vscode.TreeDragAndDropController<Bookmark> {
	private _onDidChangeTreeData: vscode.EventEmitter<Bookmark | undefined | null | void> = new vscode.EventEmitter<Bookmark | undefined | null | void>()
	readonly onDidChangeTreeData: vscode.Event<Bookmark | undefined | null | void> = this._onDidChangeTreeData.event

	dropMimeTypes = ['application/vnd.code.tree.bookmarkshBookmarkTree']
	dragMimeTypes = ['text/uri-list']

	private hasBookmark = false

	public bookmarksTree = new SetBookmark()
	private bookmarksFile = new SetBookmark()
	private bookmarksAll = new SetBookmark()

	private context: vscode.ExtensionContext
	private watcherTreeViewProvider: WatcherTreeViewProvider | undefined
	private treeViewBookmark: vscode.TreeView<Bookmark> | undefined

	constructor(context: vscode.ExtensionContext) {
		this.context = context
	}

	async init(treeView: vscode.TreeView<Bookmark>) {
		this.treeViewBookmark = treeView
		iconSymbolQuickPick.loadAllRegularlyFromLocal(this.context)

		// Khởi tạo storage mode dựa vào file JSON có tồn tại không
		bookmarkRepository.initStorageMode(this.context)
		this.updateStorageModeIcon()

		await this.initViewEditor()
	}

	setWatcherTreeViewProvider(provider: WatcherTreeViewProvider) {
		this.watcherTreeViewProvider = provider
	}

	getParent(element: Bookmark): Bookmark | undefined {
		return element.parent
	}

	getChildren(element?: Bookmark): Bookmark[] {
		if (this.bookmarksTree.size === 0) return [new Bookmark()]
		if (this.refreshing) return []
		if (element) {
			for (const child of element.subs.values) {
				child.parent = element
			}
			return Array.from(element.subs.values)
		} else {
			if (TreeModeBookmark.mode === TreeModeBookmark.Tree) {
				for (const child of this.bookmarksTree.values) {
					child.parent = undefined
				}
				return this.bookmarksTree.values
			} else if (TreeModeBookmark.mode === TreeModeBookmark.All) {
				return this.bookmarksAll.values
			} else if (TreeModeBookmark.mode === TreeModeBookmark.File) {
				return this.bookmarksFile.values
			} else {
				return this.bookmarksTree.values
			}
		}
	}

	getTreeItem(element: Bookmark): vscode.TreeItem {
		if (this.bookmarksTree.size === 0) {
			return new Bookmark({ label: 'No Bookmarks, [Ctrl + Alt + h] to add one', contextValue: ContextBookmark.None })
		}
		if (TreeModeBookmark.mode !== TreeModeBookmark.Tree && element.isBookmark) {
			const treeItem = element.copyWith({ contextValue: ContextBookmark.BookmarkFolder })
			return treeItem
		} else {
			const treeItem = element.copyWith()
			return treeItem
		}
	}

	// Drag-and-Drop
	handleDrag(source: Bookmark[], treeDataTransfer: vscode.DataTransfer): void {
		for (const i of source) {
			if (i.isBookmarkInvalid) {
				logger.showWarningMessage('Please edit invalid bookmark')
				return
			}
		}
		if (TreeModeBookmark.mode !== TreeModeBookmark.Tree) { return }
		treeDataTransfer.set('application/vnd.code.tree.bookmark', new vscode.DataTransferItem(source))
	}

	async handleDrop(target: Bookmark | undefined, treeDataTransfer: vscode.DataTransfer, token: vscode.CancellationToken): Promise<void> {
		if (TreeModeBookmark.mode !== TreeModeBookmark.Tree) { return }
		this.onHandleDrop(target, treeDataTransfer)

	}

	async onHandleDrop(target: Bookmark | undefined, treeDataTransfer: vscode.DataTransfer, extCall: boolean = false) {
		const transferItem = treeDataTransfer.get('application/vnd.code.tree.bookmark')
		if (!transferItem) {
			return
		}
		const source = new SetBookmark(transferItem.value)
		for (const bookmark of source) {
			if (bookmark.equals(target)) {
				return
			}
		}
		if (target?.isOpened) {
			if (this.bookmarksTree.moveGroupToNode(source, target)) {
				this.saveBookmarksToFile()
				if (!extCall) this.expandFolderTreeView(target)
				this._onDidChangeTreeData.fire()
				this.watcherTreeViewProvider?.refreshView()
			}
		} else {
			if (this.bookmarksTree.changeIndexNode(source, target)) {
				this.saveBookmarksToFile()
				if (!extCall) this.expandFolderTreeView(target)
				this._onDidChangeTreeData.fire()
				this.watcherTreeViewProvider?.refreshView()
			}
		}
	}
	async initViewEditor() {
		try {
			// Chỉ đọc từ autoBackupJson khi ở chế độ Workspace và có enable autoBackupJson
			if (Config.storageMode === StorageMode.WORKSPACE && Config.autoBackupJson) {
				const data = await fileHelper.readJsonFile(fileHelper.rootPath + '/.vscode/bookmarksh_data.json')
				if (data) {
					this.bookmarksTree.clear()
					const bookmarks = (data as any).bookmarks.map((item: any) => Bookmark.fromJsonImport(item))
					this.bookmarksTree.addAll(bookmarks)
				}
				// Không cần saveBookmarksToFile() ở đây vì data sẽ được save ở nơi khác
			}
			await this.getBookmarksLocal()
			this.reFilterData()
			if (TreeModeBookmark.mode === TreeModeBookmark.Tree) {
				this.onFilterTree()
			} else if (TreeModeBookmark.mode === TreeModeBookmark.All) {
				this.onFilterAll()
			} else if (TreeModeBookmark.mode === TreeModeBookmark.File) {
				this.onFilterFolder()
			} else {
				this.onFilterTree()
			}
		} catch (error) {
			logger.error(error)
		}
		this._changeModeToolbar()
		this.watcherTreeViewProvider?.initTreeView()
		this.refreshDecoration()
	}

	refreshGutter(editor: vscode.TextEditor) {
		const lines = this.getLinePaths(editor, this.bookmarksTree)
		bookmarkIcon.showBookmarkOnGutter(editor, Array.from(lines.values()))
	}

	refreshDecoration() {
		if ((this.bookmarksAll.size === 0) === this.hasBookmark) {
			this.hasBookmark = !(this.bookmarksAll.size === 0)
			vscode.commands.executeCommand('setContext', Commands.varHasBookmark, this.hasBookmark)
		}
		const editor = vscode.window.activeTextEditor
		if (editor) { this.refreshGutter(editor) }
		this._onDidChangeTreeData.fire()
		this.watcherTreeViewProvider?.refreshView()
	}

	deleteBookmarksData(id: string) {
		this.bookmarksTree.deleteBookmark(id)
		this.bookmarksAll.deleteBookmark(id)
		this.bookmarksFile.deleteBookmark(id)
	}

	moveChildrenToParentWhenDelete(bookmark: Bookmark): boolean {
		const subs = this.bookmarksTree.findBookmark(bookmark)?.subs
		const out = this.bookmarksTree.findParentBookmark(bookmark)
		if (subs) {
			if (this.bookmarksTree.moveGroupToNode(subs, out)) {
				this.deleteBookmarksData(bookmark.Id)
				this.saveBookmarksToFile()
				this.refreshDecoration()
				return true
			}
		}
		return false
	}

	async forceAddBookmark(editor: vscode.TextEditor) {
		const defaultLabel = Helper.getLabelFromSelected(editor)
		const label = await vscode.window.showInputBox({ prompt: 'Enter label for bookmark', value: `${defaultLabel}` })
		if (label === undefined || label === null) return
		if (label === '') {
			logger.showWarningMessage('Label cannot be empty')
			return
		}
		const path = fileHelper.absoluteToRelative(editor.document.uri.fsPath)
		const startPosition = editor.selection.start;
		const endPosition = editor.selection.end;
		let content = ''
		if (startPosition.isEqual(endPosition)) {
			content = editor.document.lineAt(startPosition.line).text
		} else {
			const selection = new vscode.Selection(startPosition, endPosition)
			content = editor.document.getText(selection)
		}
		const newBookmark = new Bookmark({
			path: path,
			label: label,
			content: content,
			start: new CursorIndex(startPosition.line, startPosition.character),
			end: new CursorIndex(endPosition.line, endPosition.character),
		})

		// push to tree bookmarks
		const pinBm = this.bookmarksTree.addNewBookmark(newBookmark)
		if (pinBm) {
			this.expandFolderTreeView(pinBm)
		}

		// push to all bookmarks
		this.bookmarksAll.values.push(newBookmark)
		this.bookmarksAll.sortById()

		// push to bookmarks folder
		this.bookmarksFile.addBookmarkToFolder(newBookmark)
		this.bookmarksFile.sortByPath()

		this.saveBookmarksToFile()
		this.refreshDecoration()
	}

	async forceDeleteBookmark(editor: vscode.TextEditor) {
		const lineNumber = editor.selection.start.line
		var lines = this.getLinePaths(editor, this.bookmarksTree)
		const linePath = lines.get(lineNumber)
		if (linePath) {
			let hasChange = false
			for (const id of linePath.ids) {
				this.deleteBookmarksData(id)
				hasChange = true
			}
			if (hasChange) {
				this.saveBookmarksToFile()
				this.refreshDecoration()
			}
		}
	}

	async toggleBookmark(editor: vscode.TextEditor) {
		const lineNumber = editor.selection.start.line
		var lines = this.getLinePaths(editor, this.bookmarksTree)
		const count = lines.get(lineNumber)
		if (count) {
			if (count.ids.length === 1) {
				const bookmark = this.bookmarksTree.findBookmark(new Bookmark({ Id: count.ids[0] }))
				if (bookmark) {
					await this.onDeleteBookmark(bookmark)
				}
			} else if (count.ids.length > 1) {
				logger.showWarningMessage('Cannot delete multiple bookmark. Please use force delete')
			}
		} else {
			this.forceAddBookmark(editor)
		}
	}

	changeContentFile(event: vscode.TextDocumentChangeEvent) {
		if (event.contentChanges.length === 0 ||
			vscode.window.activeTextEditor === undefined ||
			vscode.window.activeTextEditor?.document.uri.fsPath !== event.document.uri.fsPath) {
			return
		}
		event.contentChanges.forEach(change => {
			const rePath = fileHelper.absoluteToRelative(event.document.uri.fsPath)
			const hasChange = this.bookmarksTree.changeLine(rePath, change)
			if (hasChange) {
				this.refreshDecoration()
				this.saveBookmarksToFile()
			}
		})
	}

	expandFolderTreeView(bookmark: Bookmark | undefined) {
		if (!bookmark) return
		if (this.treeViewBookmark?.visible) {
			this.treeViewBookmark?.reveal(bookmark, { expand: true });
		}
		if (this.watcherTreeViewProvider?.treeView?.visible) {
			this.watcherTreeViewProvider?.treeView?.reveal(bookmark, { expand: true });
		}
	}

	getLinePaths(editor: vscode.TextEditor, setBookmark: SetBookmark): Map<number, LinePath> {
		const path = fileHelper.absoluteToRelative(editor.document.uri.fsPath)
		const bookmarks = setBookmark.getBookmarksWithPath(new SetBookmark(), path)
		const lines = new Map<number, LinePath>([])
		for (const bookmark of bookmarks) {
			const c = lines.get(bookmark.start.line)
			if (c) {
				c.ids.push(bookmark.Id)
				lines.set(bookmark.start.line, c)
			} else {
				lines.set(bookmark.start.line, new LinePath(path, bookmark.start.line, bookmark.Id))
			}
		}
		return lines
	}
	// **************** file
	canSave = false
	private timerSave = setTimeout(() => {
		if (this.canSave) {
			logger.infor('Save bookmarks to file')
			bookmarkRepository.saveBookmarksToFile(this.context, this.bookmarksTree)
		}
	}, 2000)
	saveBookmarksToFile() {
		this.canSave = true
		this.timerSave.refresh()
	}

	private reFilterData() {
		this.bookmarksAll.clear()
		this.bookmarksTree.filterBookmarkAll(this.bookmarksAll)
		this.bookmarksAll.sortById()

		this.bookmarksFile.clear()
		this.bookmarksTree.filterBookmarkFolder(this.bookmarksFile)
		this.bookmarksFile.sortByPath()
	}

	async getBookmarksLocal() {
		this.bookmarksTree.values = await bookmarkRepository.readBookmarksFromFile(this.context)
		const editor = vscode.window.activeTextEditor
		await this.readBookmarksContent()
		if (editor) {
			this.refreshDecoration()
		}
	}

	async readBookmarksContent() {
		await fileHelper.readContentBookmarkInFile(this.bookmarksTree)
	}

	// Top bar actions
	onFilterAll() {
		TreeModeBookmark.mode = TreeModeBookmark.All
		this._changeModeToolbar();
		if (this.treeViewBookmark) {
			this.treeViewBookmark.title = 'All'
		}
		this._onDidChangeTreeData.fire()
	}

	onFilterFolder() {
		TreeModeBookmark.mode = TreeModeBookmark.File
		this._changeModeToolbar();
		if (this.treeViewBookmark) {
			this.treeViewBookmark.title = 'Explorer'
		}
		this._onDidChangeTreeData.fire()
	}

	onFilterTree() {
		TreeModeBookmark.mode = TreeModeBookmark.Tree
		this._changeModeToolbar();
		if (this.treeViewBookmark) {
			this.treeViewBookmark.title = 'Tree'
		}
		this._onDidChangeTreeData.fire()
	}

	private _changeModeToolbar() {
		let changeTo = TreeModeBookmark.mode + 1
		if (changeTo > 3) {
			changeTo = 1
		}
		vscode.commands.executeCommand('setContext', Commands.varBookmarkTreeAsList, changeTo)
	}

	public refreshing = false
	private timeRefresh = setTimeout(() => {
		this.refreshing = false
		bookmarkRepository.saveBookmarksToFile(this.context, this.bookmarksTree).then(() => {
			this.initViewEditor()
		})
		this._onDidChangeTreeData.fire()
		this.watcherTreeViewProvider?._onDidChangeTreeData.fire()
	}, 500)
	onRefresh() {
		this.refreshing = true
		this._onDidChangeTreeData.fire()
		this.watcherTreeViewProvider?._onDidChangeTreeData.fire()
		this.timeRefresh.refresh()
	}

	// On click item button
	async onClickEditBookmark(bm: Bookmark) {
		const bookmark = this.bookmarksAll.findBookmark(bm)
		if (bookmark === undefined) return
		this.bookmarksAll.findBookmark(bm)
		const options: vscode.QuickPickItem[] = []
		if (!bookmark.isBookmarkInvalid) {
			options.push({ label: 'Edit Label Bookmark', description: '' })
		}
		options.push({ label: 'Replace the selected index into this bookmark without editing the title', description: '' })

		const editor = vscode.window.activeTextEditor
		if (editor && editor.document.lineAt(editor.selection.start.line).text !== '') {
			options.push({ label: 'Replace index selected to this bookmark', description: '' })
		}
		if (!bookmark.isBookmarkInvalid) {
			if (bookmark.icon !== undefined && bookmark.icon > 0) {
				options.push({ label: `$(${IconSymbol[bookmark.icon]})  Change Icon`, description: '' })
			} else {
				options.push({ label: `Change Icon`, description: '' })
			}
		}
		vscode.window.showQuickPick(options, {
			placeHolder: 'Select an option'
		}).then(async selected => {
			if (selected) {
				if (selected.label === 'Edit Label Bookmark') {
					this._editLabel(bookmark)
				} else if (selected.label === 'Replace index selected to this bookmark') {
					if (await this._editLabel(bookmark)) {
						this._replaceBookmark(bookmark)
					}
				} else if (selected.label === 'Replace the selected index into this bookmark without editing the title') {
					this._replaceBookmark(bookmark)
				} else if (selected.label === 'Change Icon') {
					const selected = await iconSymbolQuickPick.show()
					if (selected) {
						if (bookmark.icon !== undefined && bookmark.icon !== selected.iconId) {
							const index = selected.iconId
							bookmark.icon = index
							if (index > 0) {
								iconSymbolQuickPick.addRegularly(index)
								bookmarkRepository.saveRegularIcon(this.context, iconSymbolQuickPick.regularly)
							}
							this.saveBookmarksToFile()
							this.refreshDecoration()
						}
					}
				}
			}
		});
	}

	private _replaceBookmark(bookmark: Bookmark) {
		const editor = vscode.window.activeTextEditor
		if (editor) {
			bookmark.path = fileHelper.absoluteToRelative(editor.document.uri.fsPath)
			bookmark.content = editor.document.getText(editor.selection)
			bookmark.start = CursorIndex.from(editor.selection.start)
			bookmark.end = CursorIndex.from(editor.selection.end)
			if (TreeModeBookmark.mode === TreeModeBookmark.Tree) {
				bookmark.contextValue = ContextBookmark.Bookmark
			} else if (TreeModeBookmark.mode === TreeModeBookmark.File) {
				bookmark.contextValue = ContextBookmark.BookmarkFolder
			}
			this.saveBookmarksToFile()
			this.refreshDecoration()
		}
	}

	private async _editLabel(bookmark: Bookmark): Promise<boolean> {
		const newLabel = await vscode.window.showInputBox({ prompt: 'Edit Label Bookmark', value: `${bookmark.label}` })
		if (newLabel && newLabel !== '') {
			bookmark.label = newLabel
			this.saveBookmarksToFile()
			this.refreshDecoration()
			return true
		} else {
			logger.showWarningMessage('Label cannot be empty')
			return false
		}
	}

	async onDeleteBookmark(bookmark: Bookmark) {
		const hasSubs = bookmark.hasSub(this.bookmarksTree)
		if (hasSubs) {
			const confirm = await vscode.window
				.showInformationMessage("Do you want delete multiple bookmark?", "Yes", "Move children to parent", "No")
			if (confirm === "Yes") {
				this.deleteBookmarksData(bookmark.Id)
			} else if (confirm === "Move children to parent") {
				if (this.moveChildrenToParentWhenDelete(bookmark)) {
					logger.showMessage("Move children to parent success")
				} else {
					logger.showWarningMessage("Move children to parent fail")
				}
				return
			} else {
				return
			}
		} else {
			this.deleteBookmarksData(bookmark.Id)
		}
		this.saveBookmarksToFile()
		this.refreshDecoration()
	}

	onClickPinView(bookmark: Bookmark) {
		if (TreeModeBookmark.mode !== TreeModeBookmark.Tree) { return }
		if (this.bookmarksTree.pinBookmark(bookmark)) {
			this.expandFolderTreeView(bookmark)
		}
		this._onDidChangeTreeData.fire()
		this.watcherTreeViewProvider?.refreshView()
	}

	onExportBookmark(bookmark: Bookmark) {
		vscode.window.showInputBox({ prompt: 'Enter file name', value: `${bookmark.label}` })
			.then(async fileName => {
				if (fileName && fileName.length > 0) {
					bookmarkRepository.exportBookmark(bookmark, fileName)
				} else {
					logger.showWarningMessage('Filename can\'t be blank')
				}
			})
	}

	onExportAllBookmark(isBackup: boolean) {
		if (isBackup) {
			bookmarkRepository.exportAllBookmark(this.bookmarksTree, 'bookmarks_backup_' + new Date().toLocaleString().replace(/[\/:\s,]+/g, '_'))
		} else {
			vscode.window.showInputBox({ prompt: 'Enter file name', value: 'bookmarks' })
				.then(async fileName => {
					if (fileName) {
						if (fileName.length > 0) {
							bookmarkRepository.exportAllBookmark(this.bookmarksTree, fileName)
						} else {
							logger.showWarningMessage('Filename can\'t be blank')
						}
					}
				})
		}
	}

	async onImportBookmark() {
		const data = await bookmarkRepository.importBookmark()
		if (data) {
			if (data.mode === 'all') {
				const response = await vscode.window.showInformationMessage('All bookmarks will be replaced. Do you want to continue?', 'Yes', 'No')
				if (response === 'Yes') {
					this.bookmarksTree.clear()
					const bookmarks = (data as any).bookmarks.map((item: any) => Bookmark.fromJsonImport(item))
					this.bookmarksTree.addAll(bookmarks)
					logger.showMessage('All bookmarks imported')
				} else {
					return
				}
			} else {
				const bookmark = Bookmark.fromJsonImport((data as any).bookmarks)
				const conflicted = this.bookmarksTree.idConflict(new SetBookmark([bookmark]))
				if (conflicted) {
					logger.showWarningMessage(`Bookmark ID [${conflicted}] conflicted`)
					return
				} else {
					this.bookmarksTree.add(bookmark)
					logger.showMessage('The bookmarks imported')
				}
			}
			bookmarkRepository.saveBookmarksToFile(this.context, this.bookmarksTree)
			this.refreshDecoration()
		}
	}

	onRemoveAllBookmark() {
		if (this.bookmarksTree.values.length > 0) {
			vscode.window.showInformationMessage('Do you want delete all bookmarks?', 'Yes', 'No')
				.then(async selected => {
					if (selected === 'Yes') {
						this.onExportAllBookmark(true)
						this.bookmarksTree.clear()
						this.bookmarksAll.clear()
						this.bookmarksFile.clear()
						bookmarkRepository.saveBookmarksToFile(this.context, this.bookmarksTree)
						this.refreshDecoration()
					}
				})
		} else {
			logger.showMessage('No have any bookmarks')
		}
	}

	onMoveDirectory(oldPath: string, newPath: string) {
		this.bookmarksFile.removePath(oldPath, newPath)
		this.bookmarksFile.sortByPath()
		logger.infor(this.bookmarksFile.values)
		this.saveBookmarksToFile()
		this.refreshDecoration()
	}

	onRenameDirectory(oldPath: string, newPath: string) {
		this.bookmarksFile.renamePath(oldPath, newPath)
		this.saveBookmarksToFile()
		this.refreshDecoration()
	}

	onDeleteDirectory(deletePath: string) {
		const hasDelete = this.bookmarksTree.deleteWithPath(deletePath)
		this.bookmarksFile.deleteWithPath(deletePath)
		this.bookmarksAll.deleteWithPath(deletePath)
		if (hasDelete) {
			this.saveBookmarksToFile()
			this.refreshDecoration()
		}
	}

	async onToggleStorageMode() {
		logger.infor('onToggleStorageMode called')
		await bookmarkRepository.toggleStorageMode(this.context, this.bookmarksTree)
		await this.updateStorageModeIcon()
		this._onDidChangeTreeData.fire()
	}

	private async updateStorageModeIcon() {
		const isJSON = Config.storageMode === StorageMode.JSON
		logger.infor(`Updating storage mode icon: ${Config.storageMode} (isJSON: ${isJSON})`)

		vscode.commands.executeCommand('setContext', Commands.varStorageModeJSON, isJSON)
		vscode.commands.executeCommand('setContext', Commands.varStorageModeWorkspace, !isJSON)

		logger.infor(`Set context: ${Commands.varStorageModeJSON} = ${isJSON}`)
		logger.infor(`Set context: ${Commands.varStorageModeWorkspace} = ${!isJSON}`)
	}
}
