
import * as vscode from 'vscode'
import { WatcherTreeViewProvider } from '../WatcherTreeViewProvider'
import { Commands } from '../../../../util/constants/Commands'
import { Bookmark } from '../../../data/model/Bookmark'


export function actionSubscriber(context: vscode.ExtensionContext,
	provider: WatcherTreeViewProvider,
) {
	const addToWatcher = vscode.commands.registerCommand(Commands.bookmarkCommands.addToWatcher.command,
		(bookmark: Bookmark) => {
			provider.onAddWatcher(bookmark)
		})

	const removeWatcher = vscode.commands.registerCommand(Commands.bookmarkCommands.removeWatcher.command,
		(bookmark: Bookmark) => {
			provider.onRemoveWatcher(bookmark)
		})

	context.subscriptions.push(
		addToWatcher,
		removeWatcher,
	)
}
