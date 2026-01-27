
import * as vscode from 'vscode'
import { Commands } from '../../../../util/constants/Commands'
import { BookmarksTreeViewProvider } from '../BookmarkTreeViewProvider'
import { WatcherTreeViewProvider } from '../../watchers/WatcherTreeViewProvider'

export function statusBarSubscriber(
	context: vscode.ExtensionContext,
	provider: BookmarksTreeViewProvider,
) {
	const filterAll = vscode.commands.registerCommand(Commands.bookmarkCommands.filterAll.command,
		() => {
			// vscode.commands.executeCommand('workbench.view.bookmarkshTreeView')
			provider.onFilterAll()
		})
	const filterFile = vscode.commands.registerCommand(Commands.bookmarkCommands.filterFile.command,
		() => {
			provider.onFilterFolder()
		})
	const filterTree = vscode.commands.registerCommand(Commands.bookmarkCommands.filterTree.command,
		() => {
			provider.onFilterTree()
		})
	const refreshBookmark = vscode.commands.registerCommand(Commands.bookmarkCommands.refresh.command,
		() => {
			provider.onRefresh()
		})
	const importBookmark = vscode.commands.registerCommand(Commands.bookmarkCommands.importBookmark.command,
		() => {
			provider.onImportBookmark()
		})
	const exportAllBookmark = vscode.commands.registerCommand(Commands.bookmarkCommands.exportAllBookmark.command,
		() => {
			provider.onExportAllBookmark(false)
		})

	const removeAllBookmark = vscode.commands.registerCommand(Commands.bookmarkCommands.removeAllBookmark.command,
		() => {
			provider.onRemoveAllBookmark()
		})

	context.subscriptions.push(
		refreshBookmark,
		filterAll,
		filterFile,
		filterTree,
		importBookmark,
		exportAllBookmark,
		removeAllBookmark
	)
}
