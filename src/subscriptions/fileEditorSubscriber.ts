
import * as vscode from 'vscode'
import { fileHelper } from '../util/FileHelper'
import { BookmarksTreeViewProvider } from '../bookmark-provider/features/bookmarks/BookmarkTreeViewProvider'
import { TodosViewProvider } from '../bookmark-provider/features/todos/TodosViewProvider'
import path = require('path')
import { logger } from '../util/LoggerHelper'

class WatcherFileManager {
	_createPath = ''
	timer = setTimeout(() => {
		this._createPath = ''
	}, 1000)

	onDidCreateFile(event: vscode.Uri,
		bookmarkProvider: BookmarksTreeViewProvider,
		todoProvider: TodosViewProvider,
	) {
		this._createPath = fileHelper.absoluteToRelative(event.fsPath)
		this.onCreateDirectory(event.fsPath, bookmarkProvider, todoProvider)
		this.timer.refresh()

	}

	async onDidDeleteFile(event: vscode.Uri,
		bookmarkProvider: BookmarksTreeViewProvider,
		todoProvider: TodosViewProvider,
	) {
		const deletePath = fileHelper.absoluteToRelative(event.fsPath)
		if (this._createPath !== "") {
			const oldPath = deletePath
			const newPath = this._createPath
			// const oldArray = oldPath.split(path.sep)
			// const newArray = newPath.split(path.sep)
			if (path.basename(oldPath) === path.basename(newPath)) {
				//TODO: case move directory => OK
				logger.infor(`Move directory ${oldPath} to ${newPath}`)
				this.onMoveDirectory(oldPath, newPath, bookmarkProvider, todoProvider)
			} else {
				// case rename directory => OK
				logger.infor(`Rename directory ${oldPath} to ${newPath}`)
				this.onRenameDirectory(oldPath, newPath, bookmarkProvider, todoProvider)
			}
		} else {
			logger.infor(`Delete directory ${deletePath}`)
			this.onDeleteDirectory(deletePath, bookmarkProvider, todoProvider)
		}
	}

	onCreateDirectory(
		newPath: string,
		bookmarkProvider: BookmarksTreeViewProvider,
		todoProvider: TodosViewProvider,
	) {

	}

	onMoveDirectory(
		oldPath: string,
		newPath: string,
		bookmarkProvider: BookmarksTreeViewProvider,
		todoProvider: TodosViewProvider,
	) {
		bookmarkProvider.onMoveDirectory(oldPath, newPath)
	}

	onRenameDirectory(
		oldPath: string,
		newPath: string,
		bookmarkProvider: BookmarksTreeViewProvider,
		todoProvider: TodosViewProvider,
	) {
		bookmarkProvider.onRenameDirectory(oldPath, newPath)
	}

	onDeleteDirectory(
		deletePath: string,
		bookmarkProvider: BookmarksTreeViewProvider,
		todoProvider: TodosViewProvider,
	) {
		bookmarkProvider.onDeleteDirectory(deletePath)
	}
}


const watcherFileManager = new WatcherFileManager()
export function fileEditorSubscriber(context: vscode.ExtensionContext,
	bookmarkProvider: BookmarksTreeViewProvider,
	todoProvider: TodosViewProvider,
) {
	vscode.workspace.onDidChangeTextDocument(event => {
		bookmarkProvider.changeContentFile(event)
		todoProvider.changeContentFile(event)
	})

	const focusEditor = vscode.window.onDidChangeActiveTextEditor(editor => {
		if (editor) {
			bookmarkProvider.refreshGutter(editor)
		}
	})

	/// watcher for file system changes
	const watcher = vscode.workspace.createFileSystemWatcher(new vscode.RelativePattern(fileHelper.rootPath, '**/*'))
	watcher.onDidCreate((event) => {
		watcherFileManager.onDidCreateFile(event, bookmarkProvider, todoProvider)
	})
	watcher.onDidDelete((event) => {
		watcherFileManager.onDidDeleteFile(event, bookmarkProvider, todoProvider)
	})
	// end

	context.subscriptions.push(
		watcher,
		focusEditor,
	)
}
