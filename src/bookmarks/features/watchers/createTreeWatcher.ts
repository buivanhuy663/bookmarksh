
import * as vscode from 'vscode'
import { WatcherTreeViewProvider } from './WatcherTreeViewProvider'
import { Commands } from '../../../util/constants/Commands'


export function createTreeWatcher(context: vscode.ExtensionContext, treeDataProvider: WatcherTreeViewProvider) {
	const treeView = vscode.window.createTreeView(Commands.watcherTreeViewName,
		{
			treeDataProvider,
			dragAndDropController: treeDataProvider,
			canSelectMany: true,
		})
	treeDataProvider.treeView = treeView
	context.subscriptions.push(treeView)
}
