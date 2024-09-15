
import * as vscode from 'vscode'
import { BookmarksTreeViewProvider } from '../provider/BookmarkTreeViewProvider'
import { Commands } from '../util/Commands'


export function keyboardShortcutRegister(context: vscode.ExtensionContext, treeDataProvider: BookmarksTreeViewProvider) {

	const toggleBookmark = vscode.commands.registerCommand(Commands.commands.toggleBookmark.command,
		() => {
			const editor = vscode.window.activeTextEditor
			if (!editor) {
				return
			}
			treeDataProvider.toggleBookmark(editor)
		})

	const forkAddBookmark = vscode.commands.registerCommand(Commands.commands.forkAddBookmark.command,
		() => {
			const editor = vscode.window.activeTextEditor
			if (!editor) {
				return
			}
			treeDataProvider.forkAddBookmark(editor)
		})

	const forkDeleteBookmark = vscode.commands.registerCommand(Commands.commands.forkDeleteBookmark.command,
		() => {
			const editor = vscode.window.activeTextEditor
			if (!editor) {
				return
			}
			treeDataProvider.forkDeleteBookmark(editor)
		})

	context.subscriptions.push(
		toggleBookmark,
		forkAddBookmark,
		forkDeleteBookmark,
	)
}
