
import * as vscode from 'vscode'
import { BookmarksTreeViewProvider } from '../bookmark-provider/provider/BookmarkTreeViewProvider'
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

	const forceAddBookmark = vscode.commands.registerCommand(Commands.commands.forceAddBookmark.command,
		() => {
			const editor = vscode.window.activeTextEditor
			if (!editor) {
				return
			}
			treeDataProvider.forceAddBookmark(editor)
		})

	const forceDeleteBookmark = vscode.commands.registerCommand(Commands.commands.forceDeleteBookmark.command,
		() => {
			const editor = vscode.window.activeTextEditor
			if (!editor) {
				return
			}
			treeDataProvider.forceDeleteBookmark(editor)
		})

	context.subscriptions.push(
		toggleBookmark,
		forceAddBookmark,
		forceDeleteBookmark,
	)
}
