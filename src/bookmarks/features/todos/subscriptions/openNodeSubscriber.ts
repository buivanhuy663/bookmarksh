
import * as vscode from 'vscode'
import { Commands } from '../../../../util/constants/Commands'
import { fileHelper } from '../../../../util/FileHelper'
import { TodoNode } from '../../../data/model/todo/TodoNode'


export function openNodeSubscriber(context: vscode.ExtensionContext) {
	const openTodo = vscode.commands.registerCommand(Commands.openTodo,
		(todo: TodoNode) => {
			if (todo.path === undefined) return
			const fileUri = vscode.Uri.file(todo.path)
			vscode.workspace.openTextDocument(fileUri).then(doc => {
				vscode.window.showTextDocument(doc).then(editor => {
					const start = new vscode.Position(todo.line ?? 0, todo.start ?? 0)
					var range: vscode.Range = range = new vscode.Range(start, start);
					editor.selection = new vscode.Selection(range.start, range.end)
					editor.revealRange(editor.selection, vscode.TextEditorRevealType.InCenterIfOutsideViewport)

				})
			})
		})

	context.subscriptions.push(
		openTodo,
	)
}
