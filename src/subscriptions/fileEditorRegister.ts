
import * as vscode from 'vscode'
import { BookmarksTreeViewProvider } from '../bookmark-provider/provider/BookmarkTreeViewProvider'
import { fileHelper } from '../util/FileHelper'

export function fileEditorRegister(context: vscode.ExtensionContext, treeDataProvider: BookmarksTreeViewProvider) {
	const changeContent = vscode.workspace.onDidChangeTextDocument(event => {
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
		changeContent,
	)
}
