
import * as vscode from 'vscode'
import { fileHelper } from '../util/FileHelper'
import { BookmarksTreeViewProvider } from '../bookmark-provider/features/bookmarks/BookmarkTreeViewProvider'

export function fileEditorRegister(context: vscode.ExtensionContext, treeDataProvider: BookmarksTreeViewProvider) {
	vscode.workspace.onDidChangeTextDocument(event => {
		treeDataProvider.changeContentFile(event)
	})

	const focusEditor = vscode.window.onDidChangeActiveTextEditor(editor => {
		if (editor) {
			treeDataProvider.refreshGutter(editor)
		}
	})

	/// watcher for file system changes
	const watcher = vscode.workspace.createFileSystemWatcher(new vscode.RelativePattern(fileHelper.rootPath, '**/*'))
	watcher.onDidCreate((event) => {
		treeDataProvider.onDidCreateFile(event)
	})
	watcher.onDidDelete((event) => {
		treeDataProvider.onDidDeleteFile(event)
	})
	// end

	context.subscriptions.push(
		watcher,
		focusEditor,
		// changeContent,
	)
}
