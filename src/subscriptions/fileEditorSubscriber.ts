
import * as vscode from 'vscode'
import { fileHelper } from '../util/FileHelper'
import { BookmarksTreeViewProvider } from '../bookmark-provider/features/bookmarks/BookmarkTreeViewProvider'
import { TodosViewProvider } from '../bookmark-provider/features/todos/TodosViewProvider'

export function fileEditorSubscriber(context: vscode.ExtensionContext,
	bookmarkProvider: BookmarksTreeViewProvider,
	todoProvider: TodosViewProvider,
) {
	vscode.workspace.onDidChangeTextDocument(event => {
		bookmarkProvider.changeContentFile(event)
		todoProvider.onChangeFile(event)
	})

	const focusEditor = vscode.window.onDidChangeActiveTextEditor(editor => {
		if (editor) {
			bookmarkProvider.refreshGutter(editor)
		}
	})

	/// watcher for file system changes
	const watcher = vscode.workspace.createFileSystemWatcher(new vscode.RelativePattern(fileHelper.rootPath, '**/*'))
	watcher.onDidCreate((event) => {
		bookmarkProvider.onDidCreateFile(event)
	})
	watcher.onDidDelete((event) => {
		bookmarkProvider.onDidDeleteFile(event)
	})
	// end

	context.subscriptions.push(
		watcher,
		focusEditor,
		// changeContent,
	)
}
