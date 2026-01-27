import * as vscode from 'vscode';
import { fileHelper } from '../../../util/FileHelper';
import { logger } from '../../../util/LoggerHelper';
import { Bookmark } from "./Bookmark";
import path = require('path')
import { ContextBookmark } from '../../../util/ContextValue';

export class SetBookmark {
	public values: Array<Bookmark> = new Array<Bookmark>()

	constructor(bms?: Bookmark[]) {
		this.addAll(bms ?? [])
	}

	public has(value: Bookmark): boolean {
		for (const bm of this.values) {
			if (bm.equals(value)) {
				return true
			}
		}
		return false
	}

	idConflict(bookmarks: SetBookmark): string | undefined {
		const ids1: Array<string> = [];
		const ids2: Array<string> = [];
		this.getListId(ids1)
		bookmarks.getListId(ids2)
		for (const id1 of ids1) {
			for (const id2 of ids2) {
				if (id1 === id2) {
					return id1;
				}
			}
		}
	}

	getListId(out: Array<string>) {
		for (const i of this.values) {
			out.push(i.Id)
			if (i.subs.size > 0) {
				i.subs.getListId(out)
			}
		}
	}

	public add(value: Bookmark): boolean {
		if (this.has(value)) {
			return false
		} else {
			this.values.push(value)
			return true
		}
	}

	public addForce(value: Bookmark) {
		this.values.push(value)
	}

	public replace(index: number, value: Bookmark): void {
		this.values.splice(index, 1, value)
	}

	public delete(index: number): void {
		this.values.splice(index, 1)
	}

	public insert(index: number, value: Bookmark): void {
		this.values.splice(index, 0, value)
	}

	public indexOf(value: Bookmark): number {
		for (let i = 0; i < this.values.length; i++) {
			if (this.values[i].equals(value)) {
				return i
			}
		}
		return -1
	}

	public addAll(value: SetBookmark | Array<Bookmark> | undefined) {
		if (value === undefined) {
			return
		}
		for (const i of value) {
			this.add(i)
		}
	}

	public clear(): void {
		this.values = []
	}

	get(i: number): Bookmark {
		return this.values[i]
	}

	set(index: number, value: Bookmark) {
		this.values[index] = value
	}

	public filter(callbackfn: (value: Bookmark, index: number, array: Bookmark[]) => boolean, thisArg?: any): SetBookmark {
		const filteredValues = this.values.filter(callbackfn, thisArg)
		return new SetBookmark(filteredValues)
	}


	public [Symbol.iterator](): IterableIterator<Bookmark> {
		return this.values[Symbol.iterator]()
	}


	public get size(): number {
		return this.values.length
	}

	sortById() {
		this.values.sort((a, b) => {
			if (a.Id < b.Id) return -1
			if (a.Id > b.Id) return 1
			return 0
		})
	}

	sortByPath(parent?: Bookmark) {
		if (this.values.length > 0) {
			if (parent && parent.isFile) {
				this.values.sort((a, b) => {
					if (a.start.line < b.start.line) return -1
					if (a.start.line > b.start.line) return 1
					return 0
				})
			} else {
				this.values.sort((a, b) => {
					if (`${a.resourceUri?.path}` < `${b.resourceUri?.path}`) return -1
					if (`${a.resourceUri?.path}` > `${b.resourceUri?.path}`) return 1
					return 0
				})
			}
		}

		for (const i of this.values) {
			if (i.subs.size > 0) {
				i.subs.sortByPath(i)
			}
		}
	}

	// ================= 
	public getBookmarksWithPath(out: SetBookmark, path: string) {
		for (const i of this) {
			if (i.path === path) {
				out.add(i.copyWith())
			}
			if (i.subs.size > 0) {
				out = i.subs.getBookmarksWithPath(out, path)
			}
		}
		return out
	}

	public getBookmarksWithIndex(out: Array<Bookmark>, bookmark: Bookmark): Bookmark[] {
		for (const bm of this) {
			if (bm.compareIndex(bookmark)) {
				out.push(bm)
			}
			if (bm.subs.size > 0) {
				bm.subs.getBookmarksWithIndex(out, bookmark)
			}
		}
		return out
	}

	public fastDelete(bookmark: Bookmark) {
		for (let i = 0; i < this.values.length; i++) {
			if (this.values[i].equals(bookmark)) {
				this.delete(i)
				return
			}
		}
	}

	public deleteBookmark(id: string) {
		for (let i = 0; i < this.values.length; i++) {
			if (this.values[i].equals(new Bookmark({ Id: id }))) {
				this.delete(i)
				return
			}
			if (this.values[i].subs.size > 0) {
				this.values[i].subs.deleteBookmark(id)
				if (this.values[i].isDirectory) {
					if (this.values[i].subs.size == 0) {
						this.delete(i)
						return
					}
				}
			}
		}
	}

	public findBookmark(bookmark: Bookmark): Bookmark | undefined {
		for (const i of this.values) {
			if (i.equals(bookmark)) {
				return i
			}
			if (i.subs.size > 0) {
				const sub = i.subs.findBookmark(bookmark)
				if (sub !== undefined) {
					return sub
				}
			}
		}
		return undefined
	}

	public findParentBookmark(bookmark: Bookmark): Bookmark | undefined {
		for (const i of this.values) {
			if (i.subs.size > 0) {
				const sub = i.subs.findBookmark(bookmark)
				if (sub !== undefined) {
					return i
				}
				i.subs.findParentBookmark(bookmark)
			}
		}
	}

	moveGroupToNode(group: SetBookmark, target: Bookmark | undefined): boolean {
		const isChild = target?.isChildOf(group)
		if (isChild) {
			logger.showWarningMessage('Cannot move parent branch into child branch')
			return false
		}
		const newGroup = [...group]
		if (!target) {
			for (const item of group) {
				this.deleteBookmark(item.Id)
			}
			this.addAll(newGroup)
			return true
		}
		else if (target.path !== '') {
			for (const item of group) {
				this.deleteBookmark(item.Id)
			}
			target.subs.addAll(newGroup)
			return true
		}
		return false
	}

	changeIndexNode(group: SetBookmark, target: Bookmark | undefined): boolean {
		const isChild = target?.isChildOf(group)
		let hasChange = false
		if (isChild) {
			logger.showWarningMessage('Cannot move parent branch into child branch')
			return false
		}
		const newGroup = [...group]
		if (!target) { // add to last index of root
			for (const item of group) {
				this.deleteBookmark(item.Id)
			}
			this.addAll(newGroup)
			return true
		}
		else if (target.path !== '') {
			for (const item of group) {
				let setParent: SetBookmark | undefined
				if (target.parent === undefined && item.parent === undefined) {
					setParent = this
				} else if (target.parent && target.parent.equals(item.parent)) {
					setParent = target.parent.subs
				}
				if (setParent !== undefined) {
					const indexTarget = setParent.indexOf(target);
					const indexItem = setParent.indexOf(item);
					if (indexTarget >= 0 && indexItem >= 0) {
						if (indexItem === indexTarget - 1) {
							setParent.delete(indexItem)
							setParent.insert(indexTarget, item)
							hasChange = true
						} else if (indexItem > indexTarget) {
							setParent.delete(indexItem)
							setParent.insert(indexTarget, item)
							hasChange = true
						} else if (indexItem < indexTarget) {
							setParent.delete(indexItem)
							setParent.insert(indexTarget - 1, item)
							hasChange = true
						}
					}
				} else if (target.parent === undefined) {
					const indexTarget = this.indexOf(target);
					if (item.parent) {
						item.parent.subs.fastDelete(item)
					} else {
						this.fastDelete(item)
					}
					this.insert(indexTarget, item)
					hasChange = true
				} else if (target.parent !== undefined) {
					const indexTarget = target.parent.subs.indexOf(target);
					if (item.parent) {
						item.parent.subs.fastDelete(item)
					} else {
						this.fastDelete(item)
					}
					target.parent.subs.insert(indexTarget, item)
					hasChange = true
				}
			}
		}
		return hasChange
	}


	changeLine(rePath: string, change: vscode.TextDocumentContentChangeEvent): boolean {
		const textChange = change.text
		const start = change.range.start
		const end = change.range.end
		const linesAdded = change.text.split('\n').length - 1
		const linesRemoved = end.line - start.line
		const numberLine = linesAdded - linesRemoved


		let hasChange = false
		for (const bookmark of this) {
			const cacheStart = bookmark.start.copy()
			const cacheEnd = bookmark.end.copy()
			if (bookmark.subs.size > 0) {
				const cc = bookmark.subs.changeLine(rePath, change)
				if (hasChange === false) {
					hasChange = cc
				}
			}
			if (bookmark.isDirectory) continue
			if (bookmark.path === rePath) {
				//xóa nếu content trống và text	không phải \n
				if (start.line === end.line && start.line === bookmark.start.line) {
					const content = fileHelper.getDocumentCurrent()?.lineAt(bookmark.start.line).text
					if (content === '' && textChange !== '\n') {
						this.deleteBookmark(bookmark.Id) // xóa tới khi nào ko còn content
					} else if (content === '' && textChange === '\n') {
						bookmark.start.line += numberLine
						bookmark.end.line += numberLine
					}
					else if (content !== '') {
						if (!bookmark.start.equals(bookmark.end) && bookmark.start.line === bookmark.end.line) {
							if (start.line === end.line && start.character <= end.character) { // chnage on start line
								if (textChange === '') {
									if (end.character <= bookmark.start.column) {
										// Xóa trước bookmark
										logger.infor('Xóa trước bookmark')
										const c = end.character - start.character
										bookmark.start.column -= c
										bookmark.end.column -= c
									} else if (end.character > bookmark.start.column && end.character < bookmark.end.column) {
										// xóa từ giữa bookmark
										logger.infor('Xóa từ giữa bookmark')
										const c = end.character - start.character
										bookmark.end.column -= c
									} else if (start.character < bookmark.end.column && end.character >= bookmark.end.column) {
										if (start.character > bookmark.start.column) {
											// xóa sau bookmark
											logger.infor('Xóa sau bookmark')
											const c = bookmark.end.column - start.character
											bookmark.end.column -= c
										} else if (start.character <= bookmark.start.column && end.character >= bookmark.end.column) {
											// xoa toan bo
											logger.infor('Xóa toan bo')
											bookmark.end.column = 0
											bookmark.start.column = 0
										}
									}
								} else {
									if (end.character === bookmark.start.column) {
										// thêm ngay trước bookmark
										if (textChange.endsWith(' ')) {
											// nếu text cuối là space  thì lùi ký tụ
											logger.infor('nếu text cuối là space  thì lùi ký tụ')
											const c = textChange.length
											bookmark.start.column += c
											bookmark.end.column += c
										} else {
											// nếu text không rống thì thêm luôn vào bookmark
											logger.infor('nếu text không rống thì thêm luôn vào bookmark')
											let cx = 0
											for (let i = textChange.length - 1; i >= 0; i--) {
												if (textChange[i] === ' ') break
												cx++
											}
											const cStart = textChange.length - cx
											const cEnd = textChange.length
											bookmark.start.column += cStart
											bookmark.end.column += cEnd
										}
									} else if (end.character < bookmark.start.column) {
										// thêm trước bookmark cách 1 ký tụ
										logger.infor('thêm trước bookmark cách 1 ký tụ')
										const c = textChange.length
										bookmark.start.column += c
										bookmark.end.column += c
									} else if (start.character <= bookmark.start.column && end.character >= bookmark.start.column) {
										// bôi đen phần đầu và thêm text
										logger.infor('bôi đen phần đầu và thêm text')
										bookmark.start.column = start.character + textChange.length
										bookmark.end.column -= bookmark.start.column - end.character + textChange.length
									} else if (start.character >= bookmark.start.column && end.character < bookmark.end.column) {
										// thêm vào phần giữa
										logger.infor('thêm vào phần giữa')
										const c = textChange.length
										bookmark.end.column += c
									} else if (start.character === bookmark.end.column) {
										if (!textChange.startsWith(' ')) {
											// thêm vào phần cuối
											logger.infor('thêm vào phần cuối')
											const c = textChange.trim().length
											bookmark.end.column += c
										}
									}
								}
							}
						}
						else if (start.line === bookmark.start.line && bookmark.start.line < bookmark.end.line && textChange.split('\n').length > 0) {
							bookmark.end.line = textChange.split('\n').length - 1
							logger.infor('thêm dòng từ đuôi')
						}
						else if (start.line === bookmark.start.line && textChange.split('\n').length > 0) {
							// bookmark.end.line = textChange.split('\n').length - 1
							logger.infor('thêm dòng từ giữa')
							hasChange = true
						}
					}
				}
				else if (end.line < bookmark.end.line && start.line > bookmark.start.line && textChange !== '') {
					// thêm dòng ở giữa
					const c = textChange.split('\n').length - 1
					if (c > 0) {
						bookmark.end.line += c
					}
				}
				else if (end.line < bookmark.end.line && start.line > bookmark.start.line && textChange === '') {
					// xóa dòng ở giữa
					const c = end.line - start.line
					if (c > 0) {
						bookmark.end.line -= c
					}
				}
				else if ((end.line > bookmark.end.line || (end.line === bookmark.end.line && start.character < bookmark.end.column)) && start.line < bookmark.end.line && textChange === '') {
					bookmark.end.line -= bookmark.end.line - start.line
					bookmark.end.column = start.character
					const content = fileHelper.getDocumentCurrent()?.lineAt(bookmark.start.line).text
					if (content === '') {
						this.deleteBookmark(bookmark.Id)
					}
					logger.infor('xóa từ dưới đến giữa')
				}
				else if (start.line === bookmark.end.line && start.character <= bookmark.end.column && textChange === '') {
					bookmark.end.column -= bookmark.end.column - start.character
					logger.infor('xóa end từng ký tự')
				}
				else if (end.line - start.line === 1 && end.line === bookmark.end.line && textChange === '') {
					bookmark.end.line--
					bookmark.end.column = fileHelper.getDocumentCurrent()?.lineAt(bookmark.end.line).range.end.character ?? 0
					logger.infor('xóa end từng ký tự tới hết dòng')
				}
				else if (end.line > start.line && start.line === bookmark.start.line && textChange === '') {
					bookmark.end.line -= end.line - start.line
					logger.infor('xóa từ giữa tới start line')
				}

				/// NOK
				else if (bookmark.start.line === start.line && bookmark.start.line <= end.line && textChange === '' && numberLine === -1) {
					const content = fileHelper.getDocumentCurrent()?.lineAt(bookmark.start.line).text
					if (content === '') {
						this.deleteBookmark(bookmark.Id)// xoa dưới giữa

					}
				}
				else if (bookmark.start.line > start.line && bookmark.start.line === end.line && numberLine === -1) {
					const editor = vscode.window.activeTextEditor
					if (editor && editor.selection.active.character !== 0) {
						this.deleteBookmark(bookmark.Id) // xóa trên - giữa
						logger.infor('xóa trên - giữa')
					} else {
						bookmark.start.line += numberLine // con trỏ ở đầu dòng bm và xóa
						bookmark.end.line += numberLine // con trỏ ở đầu dòng bm và xóa
						logger.infor('con trỏ ở đầu dòng bm và xóa')
					}

				}
				else if (bookmark.start.line > start.line && bookmark.start.line <= end.line && numberLine !== -1 && textChange === '') {
					this.deleteBookmark(bookmark.Id) // xóa trên -  dưới 

					logger.infor('xóa trên -  dưới ')
				}
				else if (bookmark.start.line > start.line) {
					bookmark.start.line += numberLine // thêm bớt
					bookmark.end.line += numberLine // thêm bớt
					logger.infor('thêm bớt')
				}

				if (bookmark.start.line >= start.line) {

				}
			}
			if (bookmark.start.line < 0) {
				bookmark.start.line = 0
			}
			if (bookmark.end.line < 0) {
				bookmark.end.line = 0
			}
			if (bookmark.start.column < 0) {
				bookmark.start.column = 0
			}
			if (bookmark.end.column < 0) {
				bookmark.end.column = 0
			}
			if (!hasChange) {
				hasChange = !cacheStart.equals(bookmark.start) || !cacheEnd.equals(bookmark.end)
			}
		}
		return hasChange
	}

	removePath(oldPath: string, newPath: string) {
		const sub = new SetBookmark()
		this._findFolderAndRemovePath(oldPath, sub)
		sub.renamePath(oldPath, newPath)
		for (const i of sub) {
			const paths = i.path.split(path.sep).slice(0, -1).join(path.sep).split(path.sep)
			this._findFolderAndAddBookmark(this, paths, 0, i)
		}
	}

	private _findFolderAndRemovePath(oldPath: string, out: SetBookmark): number {
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

	pinBookmark(bookmark: Bookmark): boolean {
		let hasPin = false
		for (const vi of this.values) {
			if (vi.equals(bookmark)) {
				vi.isOpened = !vi.isOpened
				if (vi.isOpened) {
					hasPin = true
				}
			} else {
				vi.isOpened = false
			}
			if (vi.subs.size > 0) {
				const h = vi.subs.pinBookmark(bookmark)
				if (hasPin === false) {
					hasPin = h
				}
			}
		}
		return hasPin
	}

	addNewBookmarkToPin(bookmark: Bookmark): Bookmark | undefined {
		for (const vi of this.values) {
			if (vi.isOpened) {
				vi.subs.add(bookmark.copyWith({ parent: vi }))
				return vi
			}
			if (vi.subs.size > 0) {
				const hasChange = vi.subs.addNewBookmarkToPin(bookmark)
				if (hasChange) {
					return hasChange
				}
			}
		}
	}

	addNewBookmark(bookmark: Bookmark): Bookmark | undefined {
		const pin = this.addNewBookmarkToPin(bookmark)
		if (!pin) {
			this.add(bookmark)
		}
		return pin
	}

	filterBookmarkAll(out: SetBookmark) {
		for (const i of this) {
			out.add(i)
			if (i.subs.size > 0) {
				i.subs.filterBookmarkAll(out)
			}
		}
	}

	filterBookmarkFolder(out: SetBookmark) {
		for (const i of this) {
			if (i.path !== '') {
				out.addBookmarkToFolder(i)
			}
			if (i.subs.size > 0) {
				i.subs.filterBookmarkFolder(out);
			}
		}
	}

	// ok not change
	addBookmarkToFolder(bookmark: Bookmark) {
		const paths = bookmark.path.split(path.sep)
		this._findFolderAndAddBookmark(this, paths, 0, bookmark)
	}

	private _findFolderAndAddBookmark(out: SetBookmark, paths: string[], index: number, bookmark: Bookmark): boolean {
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

	private _createNewPathAndAddBookmark(paths: string[], index: number, bookmark: Bookmark): Bookmark {
		if (index === paths.length) {
			return bookmark
		}
		let contextValue = ContextBookmark.Folder
		if (index === paths.length - 1 && !bookmark.isDirectory) {
			contextValue = ContextBookmark.File
		} else {
			contextValue = ContextBookmark.Folder
		}
		let fsPath = paths.slice(0, index + 1).join(path.sep)
		const bm = this._createNewPathAndAddBookmark(paths, index + 1, bookmark)
		return new Bookmark({
			label: paths[index],
			path: fsPath,
			contextValue: contextValue,
			subs: new SetBookmark([bm]),
		})
	}

	private _getAllBookmarkFollowPath(out: Map<string, Bookmark[]>) {
		for (const i of this) {
			const a = out.get(i.path)
			if (a) {
				a.push(i.copyWith({ subs: new SetBookmark(), isOpened: false }))
				out.set(i.path, a)
			} else {
				out.set(i.path, [i.copyWith({ subs: new SetBookmark() })])
			}
			if (i.subs.size > 0) {
				i.subs._getAllBookmarkFollowPath(out)
			}
		}
	}
}

