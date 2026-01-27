
import * as vscode from 'vscode'
import { TodosViewProvider } from '../TodosViewProvider'
import { Commands } from '../../../../util/constants/Commands'

export function statusBarSubscriber(
	context: vscode.ExtensionContext,
	provider: TodosViewProvider,
) {
	const refreshTodo = vscode.commands.registerCommand(Commands.todoCommands.refresh.command,
		() => {
			provider.onRefresh()
		})
	const filterAll = vscode.commands.registerCommand(Commands.todoCommands.filterAll.command,
		() => {
			provider.onFilterAll()
		})
	const filterFile = vscode.commands.registerCommand(Commands.todoCommands.filterFile.command,
		() => {
			provider.onFilterFolder()
		})
	const filterTree = vscode.commands.registerCommand(Commands.todoCommands.filterTree.command,
		() => {
			provider.onFilterTree()
		})

	context.subscriptions.push(
		refreshTodo,
		filterAll,
		filterFile,
		filterTree,
	)
}
