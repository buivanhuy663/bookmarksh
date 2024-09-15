import * as vscode from 'vscode'
import { TreeMode } from '../../bookmark-provider/BookmarkTreeViewProvider'
import { fileHelper } from '../../util/FileHelper'
import { logger } from '../../util/LoggerHelper'
import { Bookmark } from "./Bookmark"
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

	idConflict(bookmarks: SetBookmark): boolean {
		const ids1: Array<string> = [];
		const ids2: Array<string> = [];
		this.getListId(ids1)
		bookmarks.getListId(ids2)
		for (const id1 of ids1) {
			for (const id2 of ids2) {
				if (id1 === id2) {
					return true;
				}
			}
		}
		return false;
	}

	getListId(out: Array<string>) {
		for (const i of this.values) {
			out.push(i.idx)
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

	public forEach(callbackfn: (value: Bookmark, index: number, set: SetBookmark) => void, thisArg?: any): void {
		for (let i = 0; i < this.values.length; i++) {
			callbackfn.call(thisArg, this.values[i], i, this)
		}
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
			if (a.idx < b.idx) return -1
			if (a.idx > b.idx) return 1
			return 0
		})
	}

	sortByLabel() {
		this.values.sort((a, b) => {
			if (a.label < b.label) return -1
			if (a.label > b.label) return 1
			return 0
		})
	}

	sortByPath() {
		this.values.sort((a, b) => {
			if (a.path < b.path) return -1
			if (a.path > b.path) return 1
			return 0
		})
	}

	sortByLine() {
		this.values.sort((a, b) => {
			if (a.line < b.line) return -1
			if (a.line > b.line) return 1
			return 0
		})
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


	public replaceLabelBookmark(bookmark: Bookmark) {
		for (let i = 0; i < this.values.length; i++) {
			if (this.values[i].equals(bookmark)) {
				this.values[i] = this.values[i].copyWith({ label: bookmark.label })
				return
			}
			if (this.values[i].subs.size > 0) {
				this.values[i].subs.replaceLabelBookmark(bookmark)
			}
		}

	}

	public deleteBookmark(idx: string) {
		for (let i = 0; i < this.values.length; i++) {
			if (this.values[i].equals(new Bookmark({ idx: idx }))) {
				this.values.splice(i, 1)
				return
			}
			if (this.values[i].subs.size > 0) {
				this.values[i].subs.deleteBookmark(idx)
			}
		}
	}

	public findBookmark(bookmark: Bookmark): Bookmark | undefined {
		for (let i = 0; i < this.values.length; i++) {
			if (this.get(i).equals(bookmark)) {
				return this.get(i)
			}
			if (this.get(i).subs.size > 0) {
				const sub = this.get(i).subs.findBookmark(bookmark)
				if (sub !== undefined) {
					return sub
				}
			}
		}
		return undefined
	}

	public findParentBookmark(out: Bookmark[], bookmark: Bookmark) {
		for (let i = 0; i < this.values.length; i++) {
			if (this.get(i).subs.size > 0) {
				const sub = this.get(i).subs.findBookmark(bookmark)
				if (sub !== undefined) {
					out[0] = this.get(i)
					return
				}
				this.get(i).subs.findParentBookmark(out, bookmark)
			}
		}
	}

	moveGroupToNode(group: SetBookmark, target: Bookmark): boolean {
		const isChild = target?.isChildOf(group)
		if (isChild) {
			logger.showWarningMessage('Cannot move parent branch into child branch')
			return false
		}
		const newGroup = [...group]
		if (target.path !== '') {
			for (const item of newGroup) {
				this.deleteBookmark(item.idx)
				target.subs.add(item)
			}
		} else {
			for (const item of newGroup) {
				this.deleteBookmark(item.idx)
			}
			this.addAll(newGroup)
		}
		return true
	}

	changeLine(rePath: string, startLine: number, endLine: number, numberLine: number, text: string): boolean {
		var change = false
		for (const i of this) {
			if (i.path === rePath) {

				//xóa nếu content trống và text	không phải \n
				if (startLine === endLine && startLine === i.line) {
					const content = fileHelper.getDocumentCurrent()?.lineAt(i.line).text
					if (content === '' && text !== '\n') {
						this.deleteBookmark(i.idx) // xóa tới khi nào ko còn content
						change = true // ok
					} else if (content === '' && text === '\n') {
						i.line += numberLine
						change = true
					}
				}


				else if (i.line === startLine && i.line <= endLine && text === '' && numberLine !== -1) {
					this.deleteBookmark(i.idx)
					change = true
				}
				else if (i.line === startLine && i.line <= endLine && text === '' && numberLine === -1) {
					const content = fileHelper.getDocumentCurrent()?.lineAt(i.line).text
					if (content === '') {
						this.deleteBookmark(i.idx) // xoa dưới giữa
						change = true
					}
				}

				else if (i.line > startLine && i.line === endLine && numberLine === -1) {
					const editor = vscode.window.activeTextEditor
					if (editor && editor.selection.active.character !== 0) {
						this.deleteBookmark(i.idx) // xóa trên - giữa
					} else {
						i.line += numberLine // con trỏ ở đầu dòng bm và xóa
					}
					change = true
				}
				else if (i.line > startLine && i.line <= endLine && numberLine !== -1 && text === '') {
					this.deleteBookmark(i.idx) // xóa trên -  dưới 
					change = true
				}
				else if (i.line > startLine) {
					i.line += numberLine // thêm bớt
				}

				if (i.line >= startLine) {
					change = true
				}

			}
			if (i.subs.size > 0) {
				const cc = i.subs.changeLine(rePath, startLine, endLine, numberLine, text)
				if (change === false) {
					change = cc
				}
			}
		}
		return change
	}

	renamePath(oldPath: string, newPath: string) {
		for (let i = 0; i < this.values.length; i++) {
			this.values[i].renamePathIfMatch(oldPath, newPath)
			if (this.values[i].subs.size > 0) {
				this.values[i].subs.renamePath(oldPath, newPath)
			}
		}
	}

	deleteWithPath(newPath: string): boolean {
		let hasDelete = false
		for (let i = 0; i < this.values.length; i++) {
			if (this.values[i].path === newPath) {
				this.values.splice(i, 1)
				hasDelete = true
				i--
				continue
			}
			if (this.values[i].subs.size > 0) {
				const de = this.values[i].subs.deleteWithPath(newPath)
				if (hasDelete === false) {
					hasDelete = de
				}
			}
		}
		return hasDelete
	}

	pinBookmark(bookmark: Bookmark): boolean {
		let hasPin = false
		for (let i = 0; i < this.size; i++) {
			const vi = this.values[i]
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
		for (let i = 0; i < this.size; i++) {
			const vi = this.values[i]
			if (vi.isOpened) {
				this.values[i].subs.add(bookmark)
				return this.values[i]
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

	filterByMode(mode: TreeMode): SetBookmark {
		const out = new SetBookmark()
		if (mode === TreeMode.All) {
			this.getAllBookmark(out)
		} else if (mode === TreeMode.File) {
			const mapB = new Map<string, Bookmark[]>()
			this.getAllBookmarkFollowPath(mapB)
			for (const [key, value] of mapB) {
				out.values.push(new Bookmark({ label: key, path: key, subs: new SetBookmark(value) }))
			}
		}
		return out
	}

	private getAllBookmark(out: SetBookmark) {
		for (const i of this) {
			out.add(i.copyWith({ subs: new SetBookmark(), isOpened: false }))
			if (i.subs.size > 0) {
				i.subs.getAllBookmark(out)
			}
		}
	}

	private getAllBookmarkFollowPath(out: Map<string, Bookmark[]>) {
		for (const i of this) {
			const a = out.get(i.path)
			if (a) {
				a.push(i.copyWith({ subs: new SetBookmark(), isOpened: false }))
				out.set(i.path, a)
			} else {
				out.set(i.path, [i.copyWith({ subs: new SetBookmark() })])
			}
			if (i.subs.size > 0) {
				i.subs.getAllBookmarkFollowPath(out)
			}
		}
	}
}

