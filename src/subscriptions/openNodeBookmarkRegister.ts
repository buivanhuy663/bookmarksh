
import * as vscode from 'vscode'
import { Bookmark } from '../bookmark-provider/data/model/Bookmark'
import { Commands } from '../util/Commands'
import { fileHelper } from '../util/FileHelper'


export function openNodeBookmarkRegister(context: vscode.ExtensionContext) {
	const openBookmark = vscode.commands.registerCommand(Commands.openBookmark,
		(bookmark: Bookmark) => {
			const fileUri = fileHelper.relativeToUri(bookmark.path)
			vscode.workspace.openTextDocument(fileUri).then(doc => {
				vscode.window.showTextDocument(doc).then(editor => {
					if (bookmark.isFile) {
						editor.selection = new vscode.Selection(new vscode.Position(0, 0), new vscode.Position(0, 0))
						return
					}
					const start = new vscode.Position(bookmark.start.line, bookmark.start.column)
					const end = new vscode.Position(bookmark.end.line, bookmark.end.column)
					var range: vscode.Range
					if (start.isEqual(end)) {
						// get range of current line
						range = editor.document.lineAt(start.line).range
						const text = editor.document.lineAt(start.line).text
						let startid = 0
						for (const i of text) {
							if (i !== '\t' && i !== ' ') break
							startid++
						}
						range = new vscode.Range(new vscode.Position(range.start.line, startid), range.end)
					} else {
						// Create a range from start to end position
						range = new vscode.Range(start, end);
					}
					editor.selection = new vscode.Selection(range.start, range.end)
					editor.revealRange(editor.selection, vscode.TextEditorRevealType.InCenterIfOutsideViewport)

				})
			})
		})

	context.subscriptions.push(
		openBookmark,
	)
}
