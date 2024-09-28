
import * as vscode from 'vscode'

export class Helper {
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
	static countId = 0;
}
