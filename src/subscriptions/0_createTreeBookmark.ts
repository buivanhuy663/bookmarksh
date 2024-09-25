
import * as vscode from 'vscode'
import { ItemType } from '../bookmark-provider/data/model/Bookmark'
import { Commands } from '../util/Commands'
import { BookmarksTreeViewProvider } from '../bookmark-provider/provider/BookmarkTreeViewProvider'


export function createTreeBookmark(context: vscode.ExtensionContext, treeDataProvider: BookmarksTreeViewProvider) {
	const treeView = vscode.window.createTreeView(Commands.bookmarkTreeViewName,
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
			if (event.element.itemType === ItemType.Bookmark) {
				treeDataProvider.saveBookmarksToFile()
			}
		}
	})
	treeView.onDidExpandElement((event) => {
		if (event) {
			event.element.collapsibleState = vscode.TreeItemCollapsibleState.Expanded
			if (event.element.itemType === ItemType.Bookmark) {
				treeDataProvider.saveBookmarksToFile()
			}
		}
	})
	// treeView.onDidChangeSelection((event) => {

	// })
	context.subscriptions.push(treeView)
}
