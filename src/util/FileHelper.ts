import * as fs from "fs"
import * as vscode from 'vscode'
import { SetBookmark } from "../bookmark-provider/data/model/SetBookmark"
import { logger } from "./LoggerHelper"
import path = require("path")
import { TodoNode } from "../bookmark-provider/data/model/todo/TodoNode"
import { todoSupporEx } from "../bookmark-provider/data/model/todo/todoSupporEx"
import { ContextBookmark } from "./ContextValue"
import { ConstantsValue } from "./constants/ConstantValue"
import { strict } from "assert"


class FileHelper {
	readonly BOOKMARKS_WORKSPACE = 'bookmarks'
	readonly WATCHER_WORKSPACE = 'watcher'
	readonly ICONS_WORKSPACE = 'icons'

	hasDir = false

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

	writeGloble(context: vscode.ExtensionContext, workspace: string, data: any) {
		context.globalState.update('bookmarksh_' + workspace, data)
	}

	readGloble(context: vscode.ExtensionContext, workspace: string) {
		try {
			const parsedData = context.globalState.get('bookmarksh_' + workspace)
			return parsedData
		} catch {
		}
	}

	readJsonFile(filePath: string): any {
		try {
			const data = fs.readFileSync(filePath, 'utf8')
			return JSON.parse(data)
		} catch (error) {
			logger.error('Can not read file')
			logger.error(error)
			return null
		}
	}

	writeJsonFile(filePath: string, data: any) {
		try {
			const jsonData = JSON.stringify(data, null, 2)
			fs.writeFileSync(filePath, jsonData, 'utf8')
		} catch (error) {
			logger.error('Can not write file')
			logger.error(error)
		}
	}

	private mapDocumentBuf: Map<string, vscode.TextDocument> = new Map()
	async readContentBookmarkInFile(
		bookmarks: SetBookmark,
	) {
		for (const item of bookmarks) {
			try {
				let content = ''
				var doc: vscode.TextDocument | undefined
				const keys = new Set(this.mapDocumentBuf.keys())
				if (keys.has(item.path)) {
					doc = this.mapDocumentBuf.get(item.path)
				} else {
					doc = await vscode.workspace.openTextDocument(this.relativeToAbsolute(item.path))
					this.mapDocumentBuf.set(item.path, doc)
					logger.infor("Open file: " + this.relativeToAbsolute(item.path))
				}
				if (doc) {
					if (doc.lineCount <= item.start.line) {
						item.contextValue = ContextBookmark.BookmarkInvalid
						continue
					}
					if (item.start.equals(item.end)) {
						content = doc.lineAt(item.start.line).text
					} else {
						const selection = new vscode.Selection(
							new vscode.Position(item.start.line, item.start.column),
							new vscode.Position(item.end.line, item.end.column)
						)
						content = doc.getText(selection)
					}
				}
				item.content = content
				if (item.subs.size > 0) {
					await this.readContentBookmarkInFile(item.subs)
				}
			} catch (error) {
				logger.error('Can read content file')
				logger.error(error)
			}
		}

		this.mapDocumentBuf.clear()
	}

	getDocumentCurrent(): vscode.TextDocument | undefined {
		const editor = vscode.window.activeTextEditor
		if (editor) {
			return editor.document
		}
	}



	///////////////////////////////
	get rootPath() {
		const workspaceFolders = vscode.workspace.workspaceFolders
		if (workspaceFolders) {
			return workspaceFolders[0].uri.fsPath
		}
		return ''
	}

	createDirectoryIfNotExist(filePath: string): boolean {
		const file = this.relativeToAbsolute(filePath)
		if (!fs.existsSync(file)) {
			fs.mkdirSync(file)
			return true

		}
		return false
	}

	relativeToAbsolute(fsPath: string): string {
		return path.join(this.rootPath, fsPath)
	}

	absoluteToRelative(fsPath: string): string {
		return path.relative(this.rootPath, fsPath)
	}

	relativeToUri(fsPath: string): vscode.Uri {
		return vscode.Uri.file(this.relativeToAbsolute(fsPath))
	}

	absoluteToUri(fsPath: string): vscode.Uri {
		return vscode.Uri.file(fsPath)
	}

	static pathExists(p: string): boolean {
		try {
			fs.accessSync(p)
		} catch (err) {
			return false
		}

		return true
	}

	async getAllTodoInRoot(
		root: string,
		findTodo: (todo: TodoNode) => void,
	) {
		const items = fs.readdirSync(root);
		for (const item of items) {
			const fullPath = path.join(root, item);
			const stat = fs.statSync(fullPath);

			if (stat.isDirectory()) {
				// Nếu là thư mục, đệ quy vào bên trong
				this.getAllTodoInRoot(fullPath, findTodo);
			} else {
				// Nếu là file, thêm vào danh sách
				if (todoSupporEx.has(path.extname(fullPath))) {
					await this.getTodoInfile(fullPath, findTodo)
				}
			}
		}
	}


	async getTodoInfile(
		filePath: string,
		findTodo: (todo: TodoNode) => void,
	) {
		const fileStream = fs.createReadStream(filePath)
		const readline = require('readline')
		const rl = readline.createInterface({
			input: fileStream,
			crlfDelay: Infinity,
		})
		let lineNumber = 0
		for await (const line of rl) {
			const match = line.match(ConstantsValue.todoRegex)
			if (match?.length ?? 0 > 0) {
				const index = (line as string).indexOf(match[0]);
				const todoNode = new TodoNode({ path: filePath, line: lineNumber, start: index, content: match[0] })
				findTodo(todoNode)
			}
			lineNumber++
		}
	}
}

export const fileHelper = new FileHelper()
