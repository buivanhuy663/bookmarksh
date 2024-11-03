
import * as vscode from 'vscode'
import { BookmarksHelpAndFeedback, Dependency } from '../sidebar/BookmarksHelpAndFeedback'


export function createHelpAndFeedback(context: vscode.ExtensionContext, treeDataProvider: BookmarksHelpAndFeedback) {
	const treeView = vscode.window.registerTreeDataProvider('bookmarkshHelpAndFeedback', treeDataProvider);


	const openUrl = vscode.commands.registerCommand('bookmarksh.openUrl', (item: Dependency) => {
		vscode.env.openExternal(vscode.Uri.parse(item.url));
	})

	context.subscriptions.push(
		treeView,
		openUrl,
	)
}
