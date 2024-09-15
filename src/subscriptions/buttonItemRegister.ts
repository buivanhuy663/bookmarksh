
import * as vscode from 'vscode'
import { Bookmark } from '../data/model/Bookmark'
import { BookmarksTreeViewProvider } from '../bookmark-provider/BookmarkTreeViewProvider'
import { WatcherTreeViewProvider } from '../bookmark-provider/WatcherTreeViewProvider'
import { Commands } from '../util/Commands'


export function buttonItemRegister(context: vscode.ExtensionContext,
	treeDataProvider: BookmarksTreeViewProvider,
	watcherDataProvider: WatcherTreeViewProvider,
) {

	const deleteButton = vscode.commands.registerCommand(Commands.commands.deleteBookmark.command,
		(bookmark: Bookmark) => {
			treeDataProvider.onClickDeleteBookmark(bookmark)
		})

	const editLabelButton = vscode.commands.registerCommand(Commands.commands.editBookmark.command,
		(bookmark: Bookmark) => {
			treeDataProvider.onClickEditBookmark(bookmark)
		})

	const pinViewButton = vscode.commands.registerCommand(Commands.commands.pinView.command,
		(bookmark: Bookmark) => {
			treeDataProvider.onClickPinView(bookmark)
		})

	const exportBookmark = vscode.commands.registerCommand(Commands.commands.exportBookmark.command,
		(bookmark: Bookmark) => {
			treeDataProvider.exportBookmark(bookmark)
		})

	const addToWatcher = vscode.commands.registerCommand(Commands.commands.addToWatcher.command,
		(bookmark: Bookmark) => {
			watcherDataProvider.addWatcher(bookmark)
		})

	const removeWatcher = vscode.commands.registerCommand(Commands.commands.removeWatcher.command,
		(bookmark: Bookmark) => {
			watcherDataProvider.removeWatcher(bookmark)
		})

	context.subscriptions.push(
		pinViewButton,
		editLabelButton,
		deleteButton,
		exportBookmark,
		addToWatcher,
		removeWatcher,
	)
}
