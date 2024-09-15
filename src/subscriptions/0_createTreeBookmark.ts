
import * as vscode from 'vscode'
import { BookmarksTreeViewProvider } from '../bookmark-provider/BookmarkTreeViewProvider'
import { Commands } from '../util/Commands'


export function createTreeBookmark(context: vscode.ExtensionContext, treeDataProvider: BookmarksTreeViewProvider) {
	const treeView = vscode.window.createTreeView(Commands.bookmarkTreeView,
		{
			treeDataProvider,
			dragAndDropController: treeDataProvider,
			canSelectMany: true,
		})
	treeDataProvider.treeView = treeView
	// treeView.onDidChangeVisibility((event) => {

	// })
	treeView.onDidCollapseElement((event) => {
		if (event) {
			event.element.collapsibleState = vscode.TreeItemCollapsibleState.Collapsed
			treeDataProvider.saveBookmarksToFile()
		}
	})
	treeView.onDidExpandElement((event) => {
		if (event) {
			event.element.collapsibleState = vscode.TreeItemCollapsibleState.Expanded
			treeDataProvider.saveBookmarksToFile()
		}
	})
	// treeView.onDidChangeSelection((event) => {

	// })
	context.subscriptions.push(treeView)
}
