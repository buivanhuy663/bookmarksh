import * as vscode from 'vscode'
import { Commands } from '../../../util/constants/Commands'
import { fileHelper } from '../../../util/FileHelper'
import { logger } from '../../../util/LoggerHelper'
import path = require('path')
import { ConstantsValue } from '../../../util/constants/ConstantValue'
import { SetTodoNode } from '../../data/model/todo/SetTodoNode'
import { TodoNode, TodoState } from '../../data/model/todo/TodoNode'
import { TreeModeTodo } from '../../data/shared_data/TreeMode'
import { ContextTodo } from '../../../util/ContextValue'

export class TodosViewProvider implements vscode.TreeDataProvider<TodoNode> {
	private _onDidChangeTreeData: vscode.EventEmitter<TodoNode | undefined | null | void> = new vscode.EventEmitter<TodoNode | undefined | null | void>()
	readonly onDidChangeTreeData: vscode.Event<TodoNode | undefined | null | void> = this._onDidChangeTreeData.event

	dropMimeTypes = ['application/vnd.code.tree.bookmarkshTodoNodeTree']
	dragMimeTypes = ['text/uri-list']

	public todoNodesTree = new SetTodoNode()
	private todoNodesFile = new SetTodoNode()
	private todoList = new SetTodoNode()

	private context: vscode.ExtensionContext
	private treeViewTodo: vscode.TreeView<TodoNode> | undefined

	private loading = false

	constructor(context: vscode.ExtensionContext) {
		this.context = context
	}

	async init(treeView: vscode.TreeView<TodoNode>) {
		this.loading = true
		if (treeView) {
			this.treeViewTodo = treeView
		}
		TreeModeTodo.mode = TreeModeTodo.Tree
		this.updateViewTitle()
		this.initViewEditor()
		vscode.commands.executeCommand('setContext', Commands.varTodoTreeAsList, TreeModeTodo.mode)
		fileHelper.getAllTodoInRoot(fileHelper.rootPath,
			(param) => {
				for (const todoParam of param) {
					const todo = TodoNode.stringToTodoNote(todoParam)
					this.todoList.add(todo)
					this.todoNodesTree.addTodoTree(todo)
					this.todoNodesFile.addTodoToExplorer(todo)
				}
				this.refreshDecoraton()
			},
			() => {
				this.loading = false
				this.updateViewTitle()
			}
		)
	}

	getChildren(element?: TodoNode): TodoNode[] {
		if (this.todoNodesTree.size === 0) return [new TodoNode()]
		if (this.refreshing) return []
		if (element) {
			return Array.from(element.subs.values)
		} else {
			if (TreeModeTodo.mode === TreeModeTodo.Tree) {
				return this.todoNodesTree.values
			} else if (TreeModeTodo.mode === TreeModeTodo.All) {
				return this.todoList.values
			} else if (TreeModeTodo.mode === TreeModeTodo.File) {
				return this.todoNodesFile.values
			} else {
				return this.todoNodesTree.values
			}
		}
	}

	getTreeItem(element: TodoNode): vscode.TreeItem {
		return element
	}

	async initViewEditor() {
		TreeModeTodo.mode = TreeModeTodo.Tree
		try {
			// this.reFilterData()
			if (TreeModeTodo.mode === TreeModeTodo.Tree) {
				this.onFilterTree()
			} else if (TreeModeTodo.mode === TreeModeTodo.All) {
				this.onFilterAll()
			} else if (TreeModeTodo.mode === TreeModeTodo.File) {
				this.onFilterFolder()
			} else {
				this.onFilterTree()
			}
		} catch (error) {
			logger.error(error)
		}
		this._changeModeToolbar()
		this.refreshDecoraton()
	}

	timeoutRefresh = false
	private timerRefresh = setTimeout(() => {
		this.timeoutRefresh = false
		this._onDidChangeTreeData.fire()
	}, 2000)
	refreshDecoraton() {
		if (!this.timeoutRefresh) {
			this._onDidChangeTreeData.fire()
			this.timeoutRefresh = true
			this.timerRefresh.refresh()
		}
	}



	private mapChange = new Map<string, NodeJS.Timeout>()
	changeContentFile(event: vscode.TextDocumentChangeEvent) {
		event.contentChanges.forEach(change => {
			const rePath = fileHelper.absoluteToRelative(event.document.uri.fsPath)
			if (this.mapChange.has(rePath)) {
				const timer = this.mapChange.get(rePath)
				timer?.refresh()

			} else {
				const timeChange = setTimeout(async () => {
					const todos = new SetTodoNode()
					await fileHelper.getTodoInfile(event.document.uri.fsPath, (param) => {
						for (const todoParam of param) {
							const todo = TodoNode.stringToTodoNote(todoParam)
							todos.add(todo)
						}
					})
					if (todos.size === 0) {
						this.todoNodesTree.removeFile(event.document.uri.fsPath)
						this.refreshDecoraton()
						return
					}
					let hasIn = false;
					for (const a of this.todoNodesTree) {
						if (a.path === event.document.uri.fsPath) {
							hasIn = true;
							a.subs?.clear();
							for (const todo of todos) {
								a.subs?.add(todo)
							}
							this.refreshDecoraton()
							break;
						}
					}
					if (!hasIn) {
						const newFile = new TodoNode({
							path: event.document.uri.fsPath,
							subs: new SetTodoNode(),
							contextValue: ContextTodo.File
						})
						for (const todo of todos) {
							newFile.subs?.add(todo)
						}
						this.todoNodesTree.add(newFile)
						this.refreshDecoraton()
					}
					logger.infor(`change ${rePath}`)
					this.mapChange.delete(rePath)
				}, 2000)

				this.mapChange.set(rePath, timeChange)
			}
		})
	}

	// **************** file
	private reFilterData() {
		// this.todoList.clear()
		// this.todoNodesTree.filterTodoNodeAll(this.todoList)
		// console.log(this.todoList.values)

		this.todoNodesFile.clear()
		this.todoNodesTree.filterTodoNodeFolder(this.todoNodesFile)
		this.todoNodesFile.sortByPath()
	}

	// Top bar actions
	onFilterAll() {
		TreeModeTodo.mode = TreeModeTodo.All
		this._changeModeToolbar();
		this.updateViewTitle()
		this._onDidChangeTreeData.fire()
	}

	onFilterFolder() {
		TreeModeTodo.mode = TreeModeTodo.File
		this._changeModeToolbar();
		this.updateViewTitle()
		this._onDidChangeTreeData.fire()
	}

	onFilterTree() {
		TreeModeTodo.mode = TreeModeTodo.Tree
		this._changeModeToolbar();
		this.updateViewTitle()
		this._onDidChangeTreeData.fire()
	}

	private _changeModeToolbar() {
		vscode.commands.executeCommand('setContext', Commands.varTodoTreeAsList, TreeModeTodo.mode)
	}

	public refreshing = false
	private timeRefresh = setTimeout(() => {
		this.refreshing = false
		this._onDidChangeTreeData.fire()
	}, 500)
	onRefresh() { // todo
		this.refreshing = true
		this._onDidChangeTreeData.fire()
		this.timeRefresh.refresh()
	}

	updateViewTitle() {
		let title = ''
		if (TreeModeTodo.mode === TreeModeTodo.Tree) {
			title = 'Tree'
		} else if (TreeModeTodo.mode === TreeModeTodo.All) {
			title = 'All'
		} else {
			title = 'Explorer'
		}
		if (this.loading) {
			title += ' (Loading⌛)'
		}
		if (this.treeViewTodo) {
			this.treeViewTodo.title = title
		}
	}

	onCreateDirectory(newPath: string) {
		fileHelper.getTodoInfile(newPath, (param) => {
			for (const todoParam of param) {
				const todo = TodoNode.stringToTodoNote(todoParam)
				this.todoList.add(todo)
				this.todoNodesTree.addTodoTree(todo)
				this.todoNodesFile.addTodoToExplorer(todo)
			}
			this.refreshDecoraton()
		})
	}

	onMoveDirectory(oldPath: string, newPath: string) {
		this.todoNodesFile.removePath(oldPath, newPath)
		this.todoNodesFile.sortByPath()
		logger.infor(this.todoNodesFile.values)
		this.refreshDecoraton()
	}

	onRenameDirectory(oldPath: string, newPath: string) {
		this.todoNodesFile.renamePath(oldPath, newPath)
		this.refreshDecoraton()
	}

	onDeleteDirectory(deletePath: string) {
		const hasDelete = this.todoNodesTree.deleteWithPath(deletePath)
		this.todoNodesFile.deleteWithPath(deletePath)
		this.todoList.deleteWithPath(deletePath)
		if (hasDelete) {
			this.refreshDecoraton()
		}
	}

	async onChangeStateTodo(type: TodoState, todo: TodoNode) {
		const edit = new vscode.WorkspaceEdit();
		const document = await vscode.workspace.openTextDocument(todo.path ?? '')
		if (document) {
			const text = document.lineAt(todo.line ?? -1).text
			const match = text.match(ConstantsValue.todoRegex)
			let indexEnd = -1
			let indexStart = -1
			if (match) {
				const index = text.indexOf(match[0])
				indexEnd = text.indexOf(':', index)
				const match2 = text.match(/todo\s*/i)
				if (match2) {
					const indexT = text.indexOf(match2[0])
					if (indexT !== -1) {
						indexStart = indexT + 4;
					}
				}
			}
			if (indexEnd >= 0 && indexStart >= 0 && indexEnd >= indexStart) {
				edit.replace(document.uri, new vscode.Range(todo.line ?? -1, indexStart, todo.line ?? -1, indexEnd), ` [${type}]`);
				vscode.workspace.applyEdit(edit)
				todo.state = type
				todo.getIcon()
				this.refreshDecoraton()
			}
		}
	}
}
