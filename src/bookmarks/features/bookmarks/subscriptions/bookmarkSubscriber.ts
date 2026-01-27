
import * as vscode from 'vscode'
import { WatcherTreeViewProvider } from '../../watchers/WatcherTreeViewProvider'
import { BookmarksTreeViewProvider } from '../BookmarkTreeViewProvider'
import { actionSubscriber } from './actionSubscriber'
import { openNodeSubscriber } from './openNodeSubscriber'
import { statusBarSubscriber } from './statusBarSubscriber'

export function bookmarkSubscriber(
	context: vscode.ExtensionContext,
	provider: BookmarksTreeViewProvider,
) {
	actionSubscriber(context, provider)
	openNodeSubscriber(context)
	statusBarSubscriber(context, provider)
}
