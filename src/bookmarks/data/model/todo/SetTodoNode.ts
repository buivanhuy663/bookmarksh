import * as vscode from 'vscode';
import path = require('path')
import { TodoNode } from './TodoNode';
import { ContextTodo } from '../../../../util/ContextValue';
import { fileHelper } from '../../../../util/FileHelper';

export class SetTodoNode {
	public values: Array<TodoNode> = new Array<TodoNode>()

	constructor(bms?: TodoNode[]) {
		this.addAll(bms ?? [])
	}

	public [Symbol.iterator](): IterableIterator<TodoNode> {
		return this.values[Symbol.iterator]()
	}


	public get size(): number {
		return this.values.length
	}


	public addAll(value: SetTodoNode | Array<TodoNode> | undefined) {
		if (value === undefined) {
			return
		}
		for (const i of value) {
			this.add(i)
		}
	}

	public add(value: TodoNode): boolean {
		if (this.has(value)) {
			return false
		} else {
			this.values.push(value)
			return true
		}
	}

	public addTodoTree(value: TodoNode) {
		for (const fi of this.values) {
			if (value.path === fi.path) {
				fi.subs?.add(value)
				return
			}
		}
		this.add(new TodoNode({
			path: value.path ?? '',
			subs: new SetTodoNode([value]),
			contextValue: ContextTodo.FileInList
		}))
	}

	refreshTodoInFile(): void {// TODO: implement refreshTodoInFile
	}

	filterBookmarkAll(out: SetTodoNode) {
		for (const i of this) {
			out.add(i)
			if (i.subs.size > 0) {
				i.subs.filterBookmarkAll(out)
			}
		}
	}

	// ok not change
	addTodoToExplorer(todo: TodoNode) {

		const paths = fileHelper.absoluteToRelative(todo.path).split(path.sep)
		this._findFolderAndAddTodo(this, paths, 0, todo)
	}

	private _findFolderAndAddTodo(out: SetTodoNode, paths: string[], index: number, todo: TodoNode): boolean {
		if (index === paths.length || (paths.length === 1 && paths[0] === '')) {
			out.add(todo)
			return true
		}
		for (const i of out) {
			if (i.label === paths[index]) {
				if (this._findFolderAndAddTodo(i.subs, paths, index + 1, todo)) {
					return true
				}
			}
		}
		out.addForce(this._createNewPathAndAddTodo(paths, index, todo))
		return true
	}

	private _createNewPathAndAddTodo(paths: string[], index: number, todo: TodoNode): TodoNode {
		if (index === paths.length) {
			return todo
		}
		let contextValue = ContextTodo.Folder
		if (index === paths.length - 1 && !todo.isDirectory) {
			contextValue = ContextTodo.File
		} else {
			contextValue = ContextTodo.Folder
		}
		let fsPath = paths.slice(0, index + 1).join(path.sep)
		const bm = this._createNewPathAndAddTodo(paths, index + 1, todo)
		return new TodoNode({
			label: paths[index],
			path: fsPath,
			contextValue: contextValue,
			subs: new SetTodoNode([bm]),
		})
	}

	removeFile(filePath: String): boolean {
		for (let i = 0; i < this.size; i++) {
			if (this.values[i].path === filePath) {
				this.delete(i)
				return true
			}
		}
		return false
	}

	public addForce(value: TodoNode) {
		this.values.push(value)
	}

	public replace(index: number, value: TodoNode): void {
		this.values.splice(index, 1, value)
	}

	public delete(index: number): void {
		this.values.splice(index, 1)
	}

	public insert(index: number, value: TodoNode): void {
		this.values.splice(index, 0, value)
	}

	public clear() {
		this.values = []
	}

	public has(value: TodoNode): boolean {
		for (const bm of this.values) {
			if (bm.equals(value)) {
				return true
			}
		}
		return false
	}

	sortByPath() {
		this.values.sort((a, b) => {
			if (`${a.path}` < `${b.path}`) return -1
			if (`${a.path}` > `${b.path}`) return 1
			return 0
		})
	}

	renamePath(oldPath: string, newPath: string) {
		for (const vi of this.values) {
			if (vi.path.startsWith(oldPath) || vi.path === oldPath) {
				const fsPath = vi.path.replace(oldPath, newPath)
				vi.path = fsPath
				if (vi.isDirectory) {
					vi.label = path.basename(fsPath)
					vi.resourceUri = fileHelper.relativeToUri(fsPath)
				}
			}
			if (vi.subs.size > 0) {
				vi.subs.renamePath(oldPath, newPath)
			}
		}
	}

	removePath(oldPath: string, newPath: string) {
		const sub = new SetTodoNode()
		this._findFolderAndRemovePath(oldPath, sub)
		sub.renamePath(oldPath, newPath)
		for (const i of sub) {
			const paths = i.path.split(path.sep).slice(0, -1).join(path.sep).split(path.sep)
			this._findFolderAndAddBookmark(this, paths, 0, i)
		}
	}
	private _findFolderAndAddBookmark(out: SetTodoNode, paths: string[], index: number, bookmark: TodoNode): boolean {
		if (index === paths.length || (paths.length === 1 && paths[0] === '')) {
			out.add(bookmark)
			return true
		}
		for (const i of out) {
			if (i.label === paths[index]) {
				if (this._findFolderAndAddBookmark(i.subs, paths, index + 1, bookmark)) {
					return true
				}
			}
		}
		out.addForce(this._createNewPathAndAddBookmark(paths, index, bookmark))
		return true
	}

	private _findFolderAndRemovePath(oldPath: string, out: SetTodoNode): number {
		for (let i = 0; i < this.values.length;) {
			const vi = this.values[i]
			if (vi.path === oldPath) {
				out.add(vi)
				this.delete(i)
				return this.size
			}
			if (vi.subs.size > 0) {
				const size = this.values[i].subs._findFolderAndRemovePath(oldPath, out)
				if (size === 0) {
					this.delete(i)
					return this.size
				}
			}
			i++
		}
		return this.size
	}

	private _createNewPathAndAddBookmark(paths: string[], index: number, bookmark: TodoNode): TodoNode {
		if (index === paths.length) {
			return bookmark
		}
		let contextValue = ContextTodo.Folder
		if (index === paths.length - 1 && !bookmark.isDirectory) {
			contextValue = ContextTodo.File
		} else {
			contextValue = ContextTodo.Folder
		}
		let fsPath = paths.slice(0, index + 1).join(path.sep)
		const bm = this._createNewPathAndAddBookmark(paths, index + 1, bookmark)
		return new TodoNode({
			label: paths[index],
			path: fsPath,
			contextValue: contextValue,
			subs: new SetTodoNode([bm]),
		})
	}

	deleteWithPath(pathDeleted: string): boolean {
		let hasDelete = false
		const buf = [...this]
		for (let i = 0; i < this.values.length;) {
			if (this.values[i].path.startsWith(pathDeleted)) {
				this.delete(i)
				hasDelete = true
				continue
			}
			if (this.values[i].subs.size > 0) {
				const de = this.values[i].subs.deleteWithPath(pathDeleted)
				if (hasDelete === false) {
					hasDelete = de
				}
				if (this.values[i].isFolder && this.values[i].subs.size === 0) {
					this.delete(i)
				}
			}
			i++
		}
		return hasDelete
	}

	filterTodoNodeAll(out: SetTodoNode) {
		for (const i of this) {
			out.addAll(i.subs)
		}
	}

	filterTodoNodeFolder(out: SetTodoNode) {
		for (const i of this) {
			for (const j of i.subs) {
				out.addBookmarkToFolder(j)
			}
		}
	}

	addBookmarkToFolder(bookmark: TodoNode) {
		const paths = bookmark.path.split(path.sep)
		this._findFolderAndAddBookmark(this, paths, 0, bookmark)
	}
}

