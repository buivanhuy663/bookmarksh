import * as fs from "fs"
import * as vscode from 'vscode'
import { SetBookmark } from "../data/model/SetBookmark"
import { Helper } from "./Helper"
import path = require("path")


class FileHelper {
	readonly BOOKMARKS_WORKSPACE = 'bookmarks'
	readonly WATCHER_WORKSPACE = 'watcher'

	hasDir = false

	createDirectoryIfNotExist(filePath: string): boolean {
		const file = path.join(this.getRootPath() ?? '', filePath)
		if (!fs.existsSync(file)) {
			fs.mkdirSync(file)
			return true

		}
		return false
	}

	getRootPath(): string | undefined {
		return vscode.workspace.workspaceFolders?.[0].uri.fsPath
	}

	readWorkspace(context: vscode.ExtensionContext, workspace: string): any {
		try {
			const parsedData = context.workspaceState.get(workspace)
			return parsedData
		} catch {

		}
	}

	writeWorkspace(context: vscode.ExtensionContext, workspace: string, data: any) {
		context.workspaceState.update(workspace, data)
	}

	readJsonFile(filePath: string): any {
		try {
			const data = fs.readFileSync(filePath, 'utf8')
			return JSON.parse(data)
		} catch (error) {
			console.error('Can not read file')
			console.error(error)
			return null
		}
	}

	writeJsonFile(filePath: string, data: any) {
		try {
			const jsonData = JSON.stringify(data, null, 2)
			fs.writeFileSync(filePath, jsonData, 'utf8')
		} catch (error) {
			console.error('Can not write file')
			console.error(error)
		}
	}

	async readContentBookmarkInFile(
		mapContent: Map<string, vscode.TextDocument>,
		listPath: Set<String>,
		bookmarks: SetBookmark,
	) {
		for (let i = 0; i < bookmarks.size; i++) {
			try {
				var item = bookmarks.get(i)
				var des = item.description ?? ''
				if (listPath.has(item.path)) {
					des = mapContent.get(item.path)?.lineAt(item.line).text.trim() ?? ''
				} else {
					const document = await vscode.workspace.openTextDocument(Helper.rootPath + "/" + item.path)
					mapContent.set(item.path, document)
					listPath.add(item.path)
					des = mapContent.get(item.path)?.lineAt(item.line).text.trim() ?? ''
				}
				if (des.length > 80) {
					des = des.substring(0, 80) + ' ...'
				}
				bookmarks.set(i, item.copyWith({ tooltip: des }))
				if (item.subs.size > 0) {
					await this.readContentBookmarkInFile(mapContent, listPath, item.subs)
				}
			} catch (error) {
				console.error('Can read content file')
				console.error(error)
			}
		}
	}

	getDocumentCurrent(): vscode.TextDocument | undefined {
		const editor = vscode.window.activeTextEditor
		if (editor) {
			return editor.document
		}
	}
}

export const fileHelper = new FileHelper()
