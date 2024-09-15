
import * as vscode from 'vscode'
import { Bookmark } from '../data/model/Bookmark'
import { BookmarksTreeViewProvider } from '../provider/BookmarkTreeViewProvider'
import { Commands } from '../util/Commands'
import { Helper } from '../util/Helper'


export function openNodeBookmarkRegister(context: vscode.ExtensionContext, treeDataProvider: BookmarksTreeViewProvider) {
	const openBookmark = vscode.commands.registerCommand(Commands.openBookmark,
		(bookmark: Bookmark) => {
			const fileUri = vscode.Uri.file(Helper.rootPath + "/" + bookmark.path)
			vscode.workspace.openTextDocument(fileUri).then(doc => {
				vscode.window.showTextDocument(doc).then(editor => {
					const position = new vscode.Position(bookmark.line, 0)
					const newSelection = new vscode.Selection(position, position)
					editor.selection = newSelection
					editor.revealRange(newSelection, vscode.TextEditorRevealType.InCenter)
				})
			})
		})

	context.subscriptions.push(
		openBookmark,
	)
}
