
import * as vscode from 'vscode'
import { Commands } from '../../../../util/constants/Commands'
import { TodosViewProvider } from '../TodosViewProvider'
import { TodoNode, TodoState } from '../../../data/model/todo/TodoNode'

export function actionSubscriber(
	context: vscode.ExtensionContext,
	provider: TodosViewProvider,
) {
	const changeState_Todo = vscode.commands.registerCommand(Commands.todoCommands.Todo.command,
		(todo: TodoNode) => { provider.onChangeStateTodo(TodoState.Todo, todo) })

	const changeState_InProgress = vscode.commands.registerCommand(Commands.todoCommands.InProgress.command,
		(todo: TodoNode) => { provider.onChangeStateTodo(TodoState.InProgress, todo) })

	const changeState_Hold = vscode.commands.registerCommand(Commands.todoCommands.Hold.command,
		(todo: TodoNode) => { provider.onChangeStateTodo(TodoState.Hold, todo) })

	const changeState_Warning = vscode.commands.registerCommand(Commands.todoCommands.Warning.command,
		(todo: TodoNode) => { provider.onChangeStateTodo(TodoState.Warning, todo) })

	const changeState_Error = vscode.commands.registerCommand(Commands.todoCommands.Error.command,
		(todo: TodoNode) => { provider.onChangeStateTodo(TodoState.Error, todo) })

	const changeState_Done = vscode.commands.registerCommand(Commands.todoCommands.Done.command,
		(todo: TodoNode) => { provider.onChangeStateTodo(TodoState.Done, todo) })

	const changeState_NeedReview = vscode.commands.registerCommand(Commands.todoCommands.NeedReview.command,
		(todo: TodoNode) => { provider.onChangeStateTodo(TodoState.NeedReview, todo) })

	const changeState_NeedRemove = vscode.commands.registerCommand(Commands.todoCommands.NeedRemove.command,
		(todo: TodoNode) => { provider.onChangeStateTodo(TodoState.NeedRemove, todo) })

	const changeState_NeedImprove = vscode.commands.registerCommand(Commands.todoCommands.NeedImprove.command,
		(todo: TodoNode) => { provider.onChangeStateTodo(TodoState.NeedImprove, todo) })


	context.subscriptions.push(
		changeState_Todo,
		changeState_InProgress,
		changeState_Hold,
		changeState_Warning,
		changeState_Error,
		changeState_Done,
		changeState_NeedReview,
		changeState_NeedRemove,
		changeState_NeedImprove,
	)
}
