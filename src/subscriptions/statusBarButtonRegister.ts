
import * as vscode from 'vscode'
import { WatcherTreeViewProvider } from '../bookmark-provider/features/watchers/WatcherTreeViewProvider'
import { Commands } from '../util/constants/Commands'
import { BookmarksTreeViewProvider } from '../bookmark-provider/features/bookmarks/BookmarkTreeViewProvider'

export function statusBarButtonRegister(
	context: vscode.ExtensionContext,
	treeDataProvider: BookmarksTreeViewProvider,
	watcherDataProvider: WatcherTreeViewProvider,
	treeView: vscode.TreeView<vscode.TreeItem>,
) {
	const filterAll = vscode.commands.registerCommand(Commands.commands.filterAll.command,
		() => {
			// vscode.commands.executeCommand('workbench.view.bookmarkshTreeView')
			treeDataProvider.onFilterAll()
		})
	const filterFile = vscode.commands.registerCommand(Commands.commands.filterFile.command,
		() => {
			treeDataProvider.onFilterFolder()
		})
	const filterTree = vscode.commands.registerCommand(Commands.commands.filterTree.command,
		() => {
			treeDataProvider.onFilterTree()
		})
	const refresh = vscode.commands.registerCommand(Commands.commands.refresh.command,
		() => {
			treeDataProvider.onRefresh()
		})
	const importBookmark = vscode.commands.registerCommand(Commands.commands.importBookmark.command,
		() => {
			treeDataProvider.onImportBookmark()
		})
	const exportAllBookmark = vscode.commands.registerCommand(Commands.commands.exportAllBookmark.command,
		() => {
			treeDataProvider.onExportAllBookmark(false)
		})

	const removeAllWatcher = vscode.commands.registerCommand(Commands.commands.removeAllWatcher.command,
		() => {
			watcherDataProvider.onRemoveAllWatchers()
		})

	const removeAllBookmark = vscode.commands.registerCommand(Commands.commands.removeAllBookmark.command,
		() => {
			treeDataProvider.onRemoveAllBookmark()
		})

	context.subscriptions.push(
		refresh,
		filterAll,
		filterFile,
		filterTree,
		importBookmark,
		exportAllBookmark,
		removeAllWatcher,
		removeAllBookmark
	)
}
