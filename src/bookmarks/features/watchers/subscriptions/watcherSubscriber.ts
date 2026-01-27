
import * as vscode from 'vscode'
import { WatcherTreeViewProvider } from '../WatcherTreeViewProvider'
import { actionSubscriber } from './actionSubscriber'
import { statusBarSubscriber } from './statusBarSubscriber'

export function watcherSubscriber(
	context: vscode.ExtensionContext,
	provider: WatcherTreeViewProvider,
) {
	actionSubscriber(context, provider)
	statusBarSubscriber(context, provider)
}
