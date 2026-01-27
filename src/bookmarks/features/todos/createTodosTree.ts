
import * as vscode from 'vscode'
import { Commands } from '../../../util/constants/Commands';
import { TodosViewProvider } from './TodosViewProvider';


export function createTodosTree(context: vscode.ExtensionContext, provider: TodosViewProvider) {
	const treeView = vscode.window.createTreeView(Commands.todosTreeViewName,
		{
			treeDataProvider: provider,
			canSelectMany: true,
		})

	context.subscriptions.push(
		treeView,
	)

	return treeView
}
