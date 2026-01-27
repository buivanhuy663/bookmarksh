
import * as vscode from 'vscode'
import { Commands } from '../../../../util/constants/Commands'
import { WatcherTreeViewProvider } from '../WatcherTreeViewProvider'

export function statusBarSubscriber(
	context: vscode.ExtensionContext,
	provider: WatcherTreeViewProvider,
) {

	const removeAllWatcher = vscode.commands.registerCommand(Commands.bookmarkCommands.removeAllWatcher.command,
		() => {
			provider.onRemoveAllWatchers()
		})


	context.subscriptions.push(
		removeAllWatcher,
	)
}
