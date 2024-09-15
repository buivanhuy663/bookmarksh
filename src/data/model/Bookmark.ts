import * as vscode from 'vscode'
import { BookmarkIcon } from '../../util/BookmarkIcon'
import { Commands } from '../../util/Commands'
import { SetBookmark } from './SetBookmark'
import path = require('path')

enum BookmarkType {
	None = 0,
	File = 1,
	Folder = 2,
	Line = 3,
	Text = 4
}


export class Bookmark extends vscode.TreeItem {
	public idx: string
	public type: BookmarkType
	public label: string
	public path: string
	public line: number
	public column: number
	public subs: SetBookmark
	public description?: string
	public isOpened?: boolean
	public collapsible?: vscode.TreeItemCollapsibleState
	public parent?: Bookmark
	public isWatcher: boolean = false


	constructor(param?: {
		idx?: string,
		type?: BookmarkType,
		label?: string,
		path?: string,
		line?: number,
		column?: number,
		subs?: SetBookmark,
		description?: string,
		tooltip?: vscode.MarkdownString | string,
		isOpened?: boolean,
		collapsible?: vscode.TreeItemCollapsibleState,
		parent?: Bookmark,
		isWatcher?: boolean,
	}) {
		let collap = vscode.TreeItemCollapsibleState.None
		if (param?.isOpened) {
			if (param?.isOpened === true) {
				collap = vscode.TreeItemCollapsibleState.Expanded
			}
		} else if (param?.subs?.size === 0) {
			collap = vscode.TreeItemCollapsibleState.None
		} else if (param?.collapsible) {
			collap = param?.collapsible
		} else if (param?.subs?.size ?? 0 > 0) {
			collap = vscode.TreeItemCollapsibleState.Collapsed
		}
		super(
			param?.label ?? '',
			collap
		)
		this.isWatcher = param?.isWatcher ?? false
		this.parent = param?.parent
		this.idx = param?.idx ?? ''
		this.label = param?.label ?? ''
		this.type = param?.type ?? BookmarkType.None
		this.path = param?.path ?? ''
		this.line = param?.line ?? 0
		this.column = param?.column ?? 0
		this.subs = param?.subs ?? new SetBookmark()
		this.description = `Line ${this.line + 1} : ${this.path}`
		this.isOpened = param?.isOpened ?? false
		this.tooltip = param?.tooltip
		this.contextValue = this.isWatcher ? 'watcher' : 'bookmark'
		this.iconPath = this.isOpened ?? false ?
			BookmarkIcon.getIconPath('open_folder', 'mid') :
			this.subs.size > 0 ?
				BookmarkIcon.getIconPath('folder') :
				BookmarkIcon.getIconPath('bookmark_sq', 'mid')
		this.accessibilityInformation

		this.command = {
			command: Commands.openBookmark, // Lệnh khi click vào item
			title: 'Open Bookmark', // Tên lệnh
			arguments: [this]
		}
	}

	public toJSON(): any {
		return {
			id: this.idx,
			label: this.label,
			path: this.path,
			line: this.line,
			type: this.type,
			opened: this.collapsibleState,
			subs: Array.from(this.subs).map(sub => sub.toJSON())
		}
	}

	// Hàm chuyển đổi từng object JSON thành Bookmark
	public static parseBookmark(data: any): Bookmark {
		const subs = new SetBookmark()
		if (data.subs && data.subs.length > 0) {
			for (const subItem of data.subs) {
				subs.add(this.parseBookmark(subItem))
			}
		}
		const parent = new Bookmark({
			idx: data.id,
			label: data.label,
			path: data.path,
			line: data.line,
			// subs: ,
			collapsible: data.opened,
			type: data.type
		})
		for (const bm of subs) {
			bm.parent = parent
		}
		parent.subs = subs
		return parent
	}

	public compareIndex(other: Bookmark): boolean {
		return this.path === other.path && this.line === other.line
	}

	public equals(other: Bookmark): boolean {
		return this.idx === other.idx
	}

	public copyWith(param?: {
		label?: string,
		path?: string,
		line?: number,
		subs?: SetBookmark,
		description?: string,
		tooltip?: string,
		isOpened?: boolean,
		collapsibleState?: vscode.TreeItemCollapsibleState,
		parent?: Bookmark,
		isWatcher?: boolean,
	}): Bookmark {
		return new Bookmark({
			idx: this.idx,
			label: param?.label ?? this.label,
			path: param?.path ?? this.path,
			line: param?.line ?? this.line,
			subs: param?.subs ?? this.subs,
			description: param?.description ?? this.description,
			tooltip: param?.tooltip ?? this.tooltip,
			isOpened: param?.isOpened ?? this.isOpened,
			collapsible: param?.collapsibleState ?? this.collapsibleState,
			parent: param?.parent ?? this.parent,
			isWatcher: param?.isWatcher ?? this.isWatcher,
		})
	}

	public getParent(bookmarks: Array<Bookmark>): Bookmark | null {
		for (const bm of bookmarks) {
			const parent = this._findParent(bm, this)
			if (parent) {
				return parent
			}
		}
		return null
	}

	private _findParent(parent: Bookmark, child: Bookmark): Bookmark | null {
		if (parent.subs.has(child)) {
			return parent
		}
		for (const subElement of parent.subs) {
			const found = this._findParent(subElement, child)
			if (found) {
				return found
			}
		}
		return null
	}

	isChildOf(bookmarks: SetBookmark): boolean {
		for (const bm of bookmarks) {
			if (bm.subs.has(this)) {
				return true
			}

			if (this.isChildOf(bm.subs)) {
				return true
			}

		}
		return false
	}

	hasSub(bookmarks: SetBookmark): boolean {
		const size = bookmarks.findBookmark(this)?.subs?.size ?? 0
		return size > 0
	}

	renamePathIfMatch(oldPath: string, newPath: string) {
		if (this.path === oldPath) {
			this.path = newPath
		}
	}
}

export class Watcher extends Bookmark {

}
