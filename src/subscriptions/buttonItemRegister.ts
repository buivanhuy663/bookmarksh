
import * as vscode from 'vscode'
import { Bookmark } from '../bookmark-provider/data/model/Bookmark'
import { WatcherTreeViewProvider } from '../bookmark-provider/features/watchers/WatcherTreeViewProvider'
import { Commands } from '../util/constants/Commands'
import { BookmarksTreeViewProvider } from '../bookmark-provider/features/bookmarks/BookmarkTreeViewProvider'


export function buttonItemRegister(context: vscode.ExtensionContext,
	treeDataProvider: BookmarksTreeViewProvider,
	watcherDataProvider: WatcherTreeViewProvider,
) {

	const deleteButton = vscode.commands.registerCommand(Commands.commands.deleteBookmark.command,
		(bookmark: Bookmark) => {
			treeDataProvider.onDeleteBookmark(bookmark)
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
			treeDataProvider.onExportBookmark(bookmark)
		})

	const addToWatcher = vscode.commands.registerCommand(Commands.commands.addToWatcher.command,
		(bookmark: Bookmark) => {
			watcherDataProvider.onAddWatcher(bookmark)
		})

	const removeWatcher = vscode.commands.registerCommand(Commands.commands.removeWatcher.command,
		(bookmark: Bookmark) => {
			watcherDataProvider.onRemoveWatcher(bookmark)
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
