
import * as vscode from 'vscode'
import { BookmarksTreeViewProvider } from '../bookmark-provider/BookmarkTreeViewProvider'
import { WatcherTreeViewProvider } from '../bookmark-provider/WatcherTreeViewProvider'
import { Commands } from '../util/Commands'


export function statusBarButtonRegister(context: vscode.ExtensionContext,
	treeDataProvider: BookmarksTreeViewProvider,
	watcherDataProvider: WatcherTreeViewProvider,
) {
	const filterAll = vscode.commands.registerCommand(Commands.commands.filterAll.command,
		() => {
			treeDataProvider.filterAll()
		})
	const filterFile = vscode.commands.registerCommand(Commands.commands.filterFile.command,
		() => {
			treeDataProvider.filterFile()
		})
	const filterTree = vscode.commands.registerCommand(Commands.commands.filterTree.command,
		() => {
			treeDataProvider.filterTree()
		})
	const refresh = vscode.commands.registerCommand(Commands.commands.refresh.command,
		() => {
			treeDataProvider.refresh()
		})
	const importBookmark = vscode.commands.registerCommand(Commands.commands.importBookmark.command,
		() => {
			treeDataProvider.importBookmark()
		})
	const exportAllBookmark = vscode.commands.registerCommand(Commands.commands.exportAllBookmark.command,
		() => {
			treeDataProvider.exportAllBookmark()
		})

	// const exportJson = vscode.commands.registerCommand(Commands.commands.exportJson.command,
	// 	() => {
	// 		const actions = [
	// 			{
	// 				label: 'Export data bookmarks to JSON file', action: () => {
	// 					treeDataProvider.exportAllBookmark()
	// 				}
	// 			},
	// 			{
	// 				label: 'Import Bookmark from JSON', action: () => {
	// 					treeDataProvider.importJson()
	// 				}
	// 			},
	// 		]

	// 		const quickPick = vscode.window.createQuickPick()
	// 		quickPick.items = actions.map(action => ({ label: action.label }))
	// 		quickPick.onDidAccept(() => {
	// 			const selectedAction = actions.find(action => action.label === quickPick.selectedItems[0].label)
	// 			if (selectedAction) {
	// 				selectedAction.action()
	// 			}
	// 			quickPick.hide()
	// 		})
	// 		quickPick.show()
	// 	})

	const removeAllWatcher = vscode.commands.registerCommand(Commands.commands.removeAllWatcher.command,
		() => {
			watcherDataProvider.removeAllWatchers()
		})

	context.subscriptions.push(
		refresh,
		filterAll,
		filterFile,
		filterTree,
		importBookmark,
		exportAllBookmark,
		removeAllWatcher,
	)
}
