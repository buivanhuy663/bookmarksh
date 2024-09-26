
import * as fs from 'fs'
import * as path from 'path'
import * as vscode from 'vscode'

export class Helper {
	static get rootPath() {
		const workspaceFolders = vscode.workspace.workspaceFolders
		if (workspaceFolders) {
			return workspaceFolders[0].uri.fsPath
		}
		return ''
	}

	static handleUri(fsPath: string): vscode.Uri {
		return vscode.Uri.file(path.join(Helper.rootPath, fsPath));
	}

	static pathExists(p: string): boolean {
		try {
			fs.accessSync(p)
		} catch (err) {
			return false
		}

		return true
	}

	static convertRelativePath(fsPath: string) {
		return path.relative(Helper.rootPath, fsPath)
	}

	static getRelativePathFromRoot(editor: vscode.TextEditor): string {
		const absolutePath = editor.document.uri.fsPath
		return path.relative(Helper.rootPath, absolutePath)
	}

	static getLabelFromSelected(editor: vscode.TextEditor): string {
		var selectedText = editor.document.getText(editor.selection).split('\n')[0]
		if (selectedText.length === 0) {
			selectedText = editor.document.lineAt(editor.selection.active.line).text.trim()
		}

		if (selectedText.length > 80) {
			selectedText = selectedText.substring(0, 80)
		}

		return selectedText
	}

	static getFirstLineSelected(editor: vscode.TextEditor): string {
		return editor.document.lineAt(editor.selection.active.line).text
	}

	static createNewId(): string {
		let num = new Date().getTime()
		num += this.countId++
		const baseChars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
		const base = 62
		let result = ''
		if (num === 0) {
			return '0'
		}
		while (num > 0) {
			const remainder = num % base
			result = baseChars[remainder] + result
			num = Math.floor(num / base)
		}
		return result
	}

	static highlighting = false
	private static _getSelectedColor() {
		return vscode.window.createTextEditorDecorationType({
			backgroundColor: 'rgba(255, 255, 0, 0.1)'
		});

	}

	static countId = 0;
}
