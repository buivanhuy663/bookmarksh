
import * as vscode from 'vscode'
import { BookmarksTreeViewProvider } from '../BookmarkTreeViewProvider'
import { WatcherTreeViewProvider } from '../../watchers/WatcherTreeViewProvider'
import { Commands } from '../../../../util/constants/Commands'
import { Bookmark } from '../../../data/model/Bookmark'


export function actionSubscriber(context: vscode.ExtensionContext,
	provider: BookmarksTreeViewProvider,
) {

	const toggleBookmark = vscode.commands.registerCommand(Commands.bookmarkCommands.toggleBookmark.command,
		() => {
			const editor = vscode.window.activeTextEditor
			if (!editor) {
				return
			}
			provider.toggleBookmark(editor)
		})

	const forceAddBookmark = vscode.commands.registerCommand(Commands.bookmarkCommands.forceAddBookmark.command,
		() => {
			const editor = vscode.window.activeTextEditor
			if (!editor) {
				return
			}
			provider.forceAddBookmark(editor)
		})

	const forceDeleteBookmark = vscode.commands.registerCommand(Commands.bookmarkCommands.forceDeleteBookmark.command,
		() => {
			const editor = vscode.window.activeTextEditor
			if (!editor) {
				return
			}
			provider.forceDeleteBookmark(editor)
		})


	const deleteButton = vscode.commands.registerCommand(Commands.bookmarkCommands.deleteBookmark.command,
		(bookmark: Bookmark) => {
			provider.onDeleteBookmark(bookmark)
		})

	const editLabelButton = vscode.commands.registerCommand(Commands.bookmarkCommands.editBookmark.command,
		(bookmark: Bookmark) => {
			provider.onClickEditBookmark(bookmark)
		})

	const pinViewButton = vscode.commands.registerCommand(Commands.bookmarkCommands.pinView.command,
		(bookmark: Bookmark) => {
			provider.onClickPinView(bookmark)
		})

	const exportBookmark = vscode.commands.registerCommand(Commands.bookmarkCommands.exportBookmark.command,
		(bookmark: Bookmark) => {
			provider.onExportBookmark(bookmark)
		})

	context.subscriptions.push(
		toggleBookmark,
		forceAddBookmark,
		forceDeleteBookmark,

		pinViewButton,
		editLabelButton,
		deleteButton,
		exportBookmark,
	)
}
