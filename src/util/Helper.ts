
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

	static getSelectedContent(editor: vscode.TextEditor): string {
		const selection = editor.selection
		var selectedText = editor.document.getText(selection)
		if (selectedText.length > 0) {
			selectedText = this.trimStringBeforeNewline(selectedText)
		} else {
			selectedText = this.getContentAtCurrentLine(editor)
			selectedText = this.trimStringBeforeNewline(selectedText)
		}

		if (selectedText.length > 80) {
			selectedText = selectedText.substring(0, 80)
		}

		return selectedText
	}

	static getContentAtCurrentLine(editor: vscode.TextEditor): string {
		return editor.document.lineAt(editor.selection.active.line).text
	}

	static trimStringBeforeNewline(input: string): string {
		const newlineIndex = input.indexOf('\n')
		const substring = newlineIndex === -1 ? input : input.substring(0, newlineIndex)
		return substring.trim()
	}

	static getNameFromPath(filePath: string): string {
		const fileName = path.basename(filePath)
		return fileName
	}

	static toBase62(num: number): string {
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
}
