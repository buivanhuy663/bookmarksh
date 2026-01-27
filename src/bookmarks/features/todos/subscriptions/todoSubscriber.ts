
import * as vscode from 'vscode'
import { TodosViewProvider } from '../TodosViewProvider'
import { actionSubscriber } from './actionSubscriber'
import { openNodeSubscriber } from './openNodeSubscriber'
import { statusBarSubscriber } from './statusBarSubscriber'

export function todoSubscriber(
	context: vscode.ExtensionContext,
	provider: TodosViewProvider,
) {
	actionSubscriber(context, provider)
	openNodeSubscriber(context)
	statusBarSubscriber(context, provider)
}
