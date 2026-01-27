import * as fs from "fs"
import * as vscode from 'vscode'
import { logger } from "./LoggerHelper"
import path = require("path")
import { ContextBookmark, ContextTodo } from "./ContextValue"
import { ConstantsValue } from "./constants/ConstantValue"
import { strict } from "assert"
import { SetBookmark } from "../bookmarks/data/model/SetBookmark"
import { LineParam } from "../bookmarks/data/model/todo/TodoNode"
import { todoSupportEx } from "../bookmarks/data/model/todo/todoSupportEx"
const readline = require('readline');


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

	writeGlobal(context: vscode.ExtensionContext, workspace: string, data: any) {
		context.globalState.update('bookmarksh_' + workspace, data)
	}

	readGlobal(context: vscode.ExtensionContext, workspace: string) {
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
		findTodo: (param: LineParam[]) => void,
		onFinish?: () => void

	) {
		if (root === undefined || root === null || root === '') {
			return
		}
		if (!fs.existsSync(root)) {
			logger.error(`Path does not exist: ${root}`)
			return
		}
		try {
			const items = fs.readdirSync(root);
			for (const item of items) {
				const fullPath = path.join(root, item);
				const stat = fs.statSync(fullPath);

				if (stat.isDirectory()) {
					// Nếu là thư mục, đệ quy vào bên trong
					await this.getAllTodoInRoot(fullPath, findTodo);
				} else {
					// Nếu là file, thêm vào danh sách
					if (todoSupportEx.has(path.extname(fullPath))) {
						await this.getTodoInFile(fullPath, findTodo)
					}
				}
			}
			onFinish?.()
		} catch (error) {
			logger.error(`Error reading directory: ${root}`)
			logger.error(error)
		}
	}


	async getTodoInFile(
		filePath: string,
		findTodo: (param: LineParam[]) => void,
	) {
		if (!fs.existsSync(filePath)) {
			logger.error(`File does not exist: ${filePath}`)
			return
		}

		try {
			const fileStream = fs.createReadStream(filePath);
			const rl = readline.createInterface({
				input: fileStream,
				crlfDelay: Infinity,
			});
			const listTodo: LineParam[] = []
			let lineNumber = 0;
			for await (const line of rl) {
				const match = line.match(ConstantsValue.todoRegex);
				if (match?.length ?? 0 > 0) {
					listTodo.push({ line: line, filePath: filePath, lineNum: lineNumber, match: match })
				}
				lineNumber++;
			}
			findTodo(listTodo);
		} catch (error) {
			logger.error(`Error reading file: ${filePath}`)
			logger.error(error)
		}
	}
}

export const fileHelper = new FileHelper()
