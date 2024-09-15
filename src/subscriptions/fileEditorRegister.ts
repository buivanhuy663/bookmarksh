
import * as vscode from 'vscode'
import { BookmarksTreeViewProvider } from '../bookmark-provider/BookmarkTreeViewProvider'
import { Helper } from '../util/Helper'


export function fileEditorRegister(context: vscode.ExtensionContext, treeDataProvider: BookmarksTreeViewProvider) {
	const changeContent = vscode.workspace.onDidChangeTextDocument(event => {
		treeDataProvider.changeContentFile(event)
	})

	const focusEditor = vscode.window.onDidChangeActiveTextEditor(editor => {
		if (editor) {
			treeDataProvider.initViewEditor()
		}
	})

	/// watcher for file system changes
	const watcher = vscode.workspace.createFileSystemWatcher(new vscode.RelativePattern(Helper.rootPath, '**/*'))
	watcher.onDidCreate((event) => {
		treeDataProvider.onDidCreate(event)
	})
	watcher.onDidDelete((event) => {
		treeDataProvider.onDidDelete(event)
	})
	// end

	context.subscriptions.push(
		watcher,
		focusEditor,
		changeContent,
	)
}
