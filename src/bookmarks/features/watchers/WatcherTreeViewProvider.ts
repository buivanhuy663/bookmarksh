import * as vscode from 'vscode'
import { Commands } from '../../../util/constants/Commands'
import { logger } from '../../../util/LoggerHelper'
import { Bookmark } from '../../data/model/Bookmark'
import { SetBookmark } from '../../data/model/SetBookmark'
import { watcherRepository } from '../../data/repository/WatcherTreeRepository'
import path = require('path')
import { BookmarksTreeViewProvider } from '../bookmarks/BookmarkTreeViewProvider'
import { ContextBookmark } from '../../../util/ContextValue'


export class WatcherTreeViewProvider implements vscode.TreeDataProvider<Bookmark>, vscode.TreeDragAndDropController<Bookmark> {
	public _onDidChangeTreeData: vscode.EventEmitter<Bookmark | undefined | null | void> = new vscode.EventEmitter<Bookmark | undefined | null | void>()
	readonly onDidChangeTreeData: vscode.Event<Bookmark | undefined | null | void> = this._onDidChangeTreeData.event

	dropMimeTypes = ['application/vnd.code.tree.watcherTreeView']
	dragMimeTypes = ['text/uri-list']


	treeView: vscode.TreeView<Bookmark> | undefined
	bookmarkTreeViewProvider: BookmarksTreeViewProvider

	public watcherTreeData = new SetBookmark()

	private watchers: Set<string> = new Set()

	private context: vscode.ExtensionContext

	constructor(context: vscode.ExtensionContext, bookmarkTreeViewProvider: BookmarksTreeViewProvider) {
		this.bookmarkTreeViewProvider = bookmarkTreeViewProvider
		this.context = context
	}

	initTreeView() {
		this.watchers = new Set((watcherRepository.getWatchersFromWorkspace(this.context)));
		for (const watcher of this.watchers) {
			this.addBookmarkToListWatcherView(watcher)
		}
		this._onDidChangeTreeData.fire()
	}

	getParent(element: Bookmark): Bookmark | undefined {
		return element.parent
	}

	getChildren(element?: Bookmark): Bookmark[] {
		if (this.watcherTreeData.size === 0) return [new Bookmark()]
		if (this.bookmarkTreeViewProvider.refreshing) return []
		if (element) {
			return Array.from(element.subs)
		} else {
			return this.watcherTreeData.values
		}
	}

	getTreeItem(element: Bookmark): vscode.TreeItem {
		if (this.watcherTreeData.size === 0) return new Bookmark({ Id: 'No Watcher', label: 'No Watcher', contextValue: ContextBookmark.None })
		const treeItem = element.copyWith()
		return treeItem
	}

	// Drag-and-Drop
	handleDrag(source: Bookmark[], treeDataTransfer: vscode.DataTransfer): void {
		treeDataTransfer.set('application/vnd.code.tree.bookmark', new vscode.DataTransferItem(source))
	}

	async handleDrop(target: Bookmark | undefined, treeDataTransfer: vscode.DataTransfer, token: vscode.CancellationToken): Promise<void> {
		if (target) {
			for (const item of treeDataTransfer.get('application/vnd.code.tree.bookmark')?.value) {
				if (this.watchers.has(item.id)) {
					logger.showWarningMessage('Cannot drag end drop a parent watcher')
					return
				}
			}
			this.bookmarkTreeViewProvider.onHandleDrop(target, treeDataTransfer, true)
			this.expandFolderTreeView(target)
			return
		}
		logger.showWarningMessage('Cannot find a parent watcher')
	}

	refresh() {
		this.initTreeView()
	}

	expandFolderTreeView(bookmark: Bookmark) {
		this.treeView?.reveal(bookmark, { expand: true });
	}

	refreshView() {
		this.watcherTreeData.clear()
		for (const watcher of this.watchers) {
			this.addBookmarkToListWatcherView(watcher)
		}
		this._onDidChangeTreeData.fire()
	}

	addBookmarkToListWatcherView(id: string) {
		const bookmark = this.bookmarkTreeViewProvider.bookmarksTree.findBookmark(new Bookmark({ Id: id }))
		if (bookmark) {
			this.watcherTreeData.add(bookmark.copyWith({ contextValue: ContextBookmark.Watcher }))
		} else {
			this.watchers.delete(id)
		}
		this.changeStateRemoveAllWatchers()
	}

	onAddWatcher(bookmark: Bookmark) {
		this.watchers.add(bookmark.Id)
		watcherRepository.saveWatchersToWorkspace(this.context, this.watchers)
		this.addBookmarkToListWatcherView(bookmark.Id)
		this._onDidChangeTreeData.fire()
	}

	onRemoveWatcher(bookmark: Bookmark) {
		this.watchers.delete(bookmark.Id)
		for (let i = 0; i < this.watcherTreeData.values.length; i++) {
			if (this.watcherTreeData.values[i].id === bookmark.id) {
				this.watcherTreeData.values.splice(i, 1);
				break;
			}
		}
		watcherRepository.saveWatchersToWorkspace(this.context, this.watchers)
		this._onDidChangeTreeData.fire()
		this.changeStateRemoveAllWatchers()
	}

	onRemoveAllWatchers() {
		this.watchers.clear()
		this.watcherTreeData.clear()
		watcherRepository.saveWatchersToWorkspace(this.context, this.watchers)
		this._onDidChangeTreeData.fire()
		this.changeStateRemoveAllWatchers()
	}

	changeStateRemoveAllWatchers() {
		if (this.watchers.size > 0) {
			vscode.commands.executeCommand('setContext', Commands.varHasWatcher, true)
		} else {
			vscode.commands.executeCommand('setContext', Commands.varHasWatcher, false)
		}
	}
}
