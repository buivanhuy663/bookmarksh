import path = require('path')
import * as vscode from 'vscode'
import { Commands } from '../../../../util/constants/Commands'
import { SetTodoNode } from './SetTodoNode'
import { fileHelper } from '../../../../util/FileHelper'
import { Colors } from '../../../../util/constants/Colors'
import { ContextTodo } from '../../../../util/ContextValue'
import { TreeModeTodo } from '../../shared_data/TreeMode'

export interface LineParam {
	line: string;
	filePath: string;
	lineNum: number;
	match: any;
}

export enum TodoState {
	None = 'None',
	Todo = 'Todo',
	InProgress = 'InProgress',
	Hold = 'Hold',
	Warning = 'Warning',
	Error = 'Error',
	Done = 'Done',
	NeedReview = 'NeedReview',
	NeedRemove = 'NeedRemove',
	NeedImprove = 'NeedImprove',
}

export class TodoNode extends vscode.TreeItem {
	public path: string
	public line?: number
	public start?: number
	public state?: TodoState = TodoState.None
	public content?: string
	public subs: SetTodoNode
	public contextValue?: ContextTodo
	constructor(param?: {
		label?: string
		path?: string
		line?: number
		start?: number
		content?: string
		subs?: SetTodoNode
		contextValue?: ContextTodo
	}) {

		super(
			TodoNode.getLable(param),
			TodoNode.getCollapsibleState(param)
		)
		if (param?.contextValue === ContextTodo.FileInList) {
			this.label = fileHelper.absoluteToRelative(param?.path ?? '')
		}
		this.start = param?.start
		this.contextValue = param?.contextValue ?? ContextTodo.None
		this.path = param?.path ?? ''
		this.line = param?.line
		this.content = param?.content
		this.contextValue = param?.contextValue
		if (this.contextValue === ContextTodo.FileInList
			|| this.contextValue === ContextTodo.Todo
			|| this.contextValue === ContextTodo.File) {
			this.command = {
				command: Commands.openTodo, // Lệnh khi click vào item
				title: 'Open Todo', // Tên lệnh
				arguments: [this]
			}
		}
		this.subs = param?.subs ?? new SetTodoNode()
		this.getState(param?.content)
		this.getIcon()
	}

	static stringToTodoNote(param: LineParam): TodoNode {
		const index = (param.line as string).indexOf(param.match[0]);
		const todo = new TodoNode({
			path: param.filePath, line: param.lineNum, start: index,
			content: param.match[0],
			contextValue: ContextTodo.Todo
		})
		return todo
	}

	static getCollapsibleState(param?: any): vscode.TreeItemCollapsibleState {
		let collapsible = vscode.TreeItemCollapsibleState.None
		if (param?.subs?.size === 0) {
			collapsible = vscode.TreeItemCollapsibleState.None
		} else if (param?.collapsible && (TreeModeTodo.mode === TreeModeTodo.Tree || param?.contextValue === ContextTodo.Folder || param?.contextValue === ContextTodo.File)) {
			collapsible = param?.collapsible
		} else if (param?.subs?.size ?? 0 > 0) {
			if (TreeModeTodo.mode === TreeModeTodo.Tree
				|| param?.contextValue === ContextTodo.Folder
				|| param?.contextValue === ContextTodo.File) {
				collapsible = vscode.TreeItemCollapsibleState.Collapsed
			}
		}
		return collapsible
	}

	static getLable(param?: any): any {
		if (param === undefined || param?.contextValue === undefined) {
			return 'undefine'
		}
		if (param.contextValue === ContextTodo.FileInList) {
			return fileHelper.relativeToUri(param?.path ?? '')
		}
		if (param.contextValue === ContextTodo.File || param.contextValue === ContextTodo.Folder) {
			return fileHelper.relativeToUri(param?.path ?? '')
		}
		if (param.content) {
			const index = param.content.indexOf(':');
			if (index !== -1) {
				const lable = param.content.substring(index + 1).trim()
				if (lable === '') {
					return 'undefine'
				}
				return lable
			}
		}
		return 'undefine'
	}

	getState(content?: string) {
		if (content) {
			const index = content.indexOf(':');
			const beginText = content.substring(0, index)
			const iA = beginText.indexOf('[');
			const iB = beginText.indexOf(']');
			if (iA !== -1 && iB !== -1 && iA < iB) {
				const textState = beginText.substring(iA + 1, iB)
				this.state = TodoState[textState as keyof typeof TodoState]
			}
		}
	}

	getIcon() {
		if (this.contextValue === ContextTodo.FileInList) {
			this.iconPath = vscode.ThemeIcon.File
			return
		}
		if (this.contextValue === ContextTodo.File) {
			this.iconPath = vscode.ThemeIcon.File
			return
		}
		if (this.contextValue === ContextTodo.Folder) {
			this.iconPath = vscode.ThemeIcon.Folder
			return
		}

		switch (this.state) {
			case TodoState.None:
				this.iconPath = new vscode.ThemeIcon('info', new vscode.ThemeColor(Colors.Todo.id))
				return
			case TodoState.Todo:
				this.iconPath = new vscode.ThemeIcon('run', new vscode.ThemeColor(Colors.Todo.id))
				return
			case TodoState.InProgress:
				this.iconPath = new vscode.ThemeIcon('pulse', new vscode.ThemeColor(Colors.InProgress.id))
				return
			case TodoState.Hold:
				this.iconPath = new vscode.ThemeIcon('split-vertical', new vscode.ThemeColor(Colors.Hold.id))
				return
			case TodoState.Warning:
				this.iconPath = new vscode.ThemeIcon('warning', new vscode.ThemeColor(Colors.Warning.id))
				return
			case TodoState.Error:
				this.iconPath = new vscode.ThemeIcon('error', new vscode.ThemeColor(Colors.Error.id))
				return
			case TodoState.Done:
				this.iconPath = new vscode.ThemeIcon('pass', new vscode.ThemeColor(Colors.Done.id))
				return
			case TodoState.NeedReview:
				this.iconPath = new vscode.ThemeIcon('question', new vscode.ThemeColor(Colors.NeedReview.id))
				return
			case TodoState.NeedRemove:
				this.iconPath = new vscode.ThemeIcon('remove', new vscode.ThemeColor(Colors.NeedRemove.id))
				return
			case TodoState.NeedImprove:
				this.iconPath = new vscode.ThemeIcon('add', new vscode.ThemeColor(Colors.NeedImprove.id))
				return
		}
		this.iconPath = new vscode.ThemeIcon('info', new vscode.ThemeColor(Colors.Todo.id))
	}

	public equals(other: TodoNode | undefined): boolean {
		if (!other) return false
		return this.path === other.path && this.line === other.line
	}

	public copyWith(param?: {
		path?: string
		line?: number
		start?: number
		content?: string
		sub?: SetTodoNode
		contextValue?: ContextTodo
	}): TodoNode {
		return new TodoNode({
			path: param?.path ?? this.path,
			line: param?.line ?? this.line,
			start: param?.start ?? this.start,
			content: param?.content ?? this.content,
			subs: param?.sub ?? this.subs,
			contextValue: param?.contextValue ?? this.contextValue
		})
	}

	get isFile(): boolean {
		return this.contextValue === ContextTodo.File
	}
	get isFolder(): boolean {
		return this.contextValue === ContextTodo.Folder
	}
	get isDirectory(): boolean {
		return this.isFile || this.isFolder
	}
	get isTodo(): boolean {
		return this.contextValue === ContextTodo.Todo
	}
}

// Todo: handle feature
// Todo [NeedReview]:
