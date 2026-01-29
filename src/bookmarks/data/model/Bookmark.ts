import * as os from 'os'
import * as vscode from 'vscode'
import { IconType, bookmarkIcon } from '../../../util/BookmarkIcon'
import { Commands } from '../../../util/constants/Commands'
import { fileHelper } from '../../../util/FileHelper'
import { Helper } from '../../../util/Helper'
import { logger } from '../../../util/LoggerHelper'
import { IconSymbol } from '../../../util/quick_pick_icon/IconSymbol'
import { TreeModeBookmark } from '../shared_data/TreeMode'
import { SetBookmark } from './SetBookmark'
import path = require('path')
import { ContextBookmark } from '../../../util/ContextValue'
import { Colors } from '../../../util/constants/Colors'



// export enum BookmarkType {
// 	None = 0,
// 	File = 1, // symbol-file
// 	Folder = 2, // symbol-folder
// 	Method = 3, // symbol-method
// 	Call = 4, //symbol-class
// 	Object = 5, // symbol-object
// 	Class = 6,
// 	Interface = 7,
// 	Enum = 8, // symbol-enum
// 	Array = 9,  // symbol-array
// 	Variable = 10, // symbol-variable
// }

enum BookmarkParam {
	Icon = 0,
	StartLine = 1,
	StartColumn = 2,
	EndLine = 3,
	EndColumn = 4,
}

export class CursorIndex {
	public line: number
	public column: number
	constructor(line: number, column: number) {
		this.line = line
		this.column = column
	}
	static from(position: vscode.Position): CursorIndex {
		return new CursorIndex(position.line, position.character)
	}

	equals(other: CursorIndex) {
		return this.line === other.line && this.column === other.column
	}

	copy(): CursorIndex {
		return new CursorIndex(this.line, this.column)
	}
}

export class Bookmark extends vscode.TreeItem {
	public Id: string
	public icon: number
	public path: string
	public subs: SetBookmark
	public isOpened?: boolean
	public collapsible?: vscode.TreeItemCollapsibleState
	public parent?: Bookmark
	public content?: string

	public start: CursorIndex
	public end: CursorIndex

	constructor(param?: {
		Id?: string
		contextValue?: string
		icon?: number
		label?: string | vscode.TreeItemLabel
		path?: string
		column?: number
		subs?: SetBookmark
		content?: string
		isOpened?: boolean
		collapsible?: vscode.TreeItemCollapsibleState
		parent?: Bookmark
		start?: CursorIndex
		end?: CursorIndex
	}) {
		if (param?.contextValue === ContextBookmark.None) {
			super(param?.label ?? '', vscode.TreeItemCollapsibleState.None)
			if (param.Id === 'No Watcher') {
				this.iconPath = bookmarkIcon.getIcon(IconType.watcher)
			} else {
				this.iconPath = bookmarkIcon.getIcon(IconType.bookmark)
			}
			this.icon = 0
			this.path = ''
			this.subs = new SetBookmark()
			this.start = new CursorIndex(0, 0)
			this.end = new CursorIndex(0, 0)
			this.Id = Helper.createNewId()
		} else {

			// get collapsible state
			const collapsible = Bookmark._handleCollapsible(param)
			////
			if (param?.contextValue === ContextBookmark.File || param?.contextValue === ContextBookmark.Folder) {
				const uri = fileHelper.relativeToUri(param?.path ?? '')
				super(
					uri,
					collapsible
				)
				this.label = path.basename(uri.fsPath)
			} else {
				if (param?.contextValue === ContextBookmark.BookmarkInvalid) {
					super({
						label: `${param?.label}`.trim(),
						highlights: [[0, `${param?.label}`.trim().length]]
					},
						collapsible
					)

				} else {
					super(
						`${param?.label}`.trim(),
						collapsible
					)
					this.label
				}
			}
			if (param?.Id && param?.Id !== '') {
				this.Id = param?.Id
			} else {
				this.Id = Helper.createNewId()
			}
			this.content = param?.content?.trim()
			this.contextValue = param?.contextValue ?? ContextBookmark.Bookmark
			this.start = param?.start ?? new CursorIndex(0, 0)
			this.end = param?.end ?? new CursorIndex(0, 0)
			this.parent = param?.parent
			this.icon = param?.icon ?? 0
			this.path = param?.path ?? ''
			this.subs = param?.subs ?? new SetBookmark()
			if (!this.isDirectory) {
				const children = this.subs.size > 0 ? `Children: ${this.subs.size}, ` : ''
				if (this.isBookmarkInvalid) {
					this.description = `Bookmark invalid`
				} else {
					this.description = `${children}Line ${this.start.line + 1} : ${this.path}`
				}
			}
			this.isOpened = param?.isOpened ?? false
			this._setIconPath()
			if (this.contextValue === ContextBookmark.Bookmark || this.contextValue === ContextBookmark.Watcher || this.contextValue === ContextBookmark.File || this.contextValue === ContextBookmark.BookmarkFolder) {
				this.command = {
					command: Commands.openBookmark, // Lệnh khi click vào item
					title: 'Open Bookmark', // Tên lệnh
					arguments: [this]
				}
			}
			this._handleTooltip()
		}
	}

	private static _handleCollapsible(param?: any): vscode.TreeItemCollapsibleState {
		let collapsible = vscode.TreeItemCollapsibleState.None
		if (param?.isOpened) {
			if (param?.isOpened === true && TreeModeBookmark.mode === TreeModeBookmark.Tree) {
				collapsible = vscode.TreeItemCollapsibleState.Expanded
			}
		} else if (param?.subs?.size === 0) {
			collapsible = vscode.TreeItemCollapsibleState.None
		} else if (param?.collapsible && (TreeModeBookmark.mode === TreeModeBookmark.Tree || param?.contextValue === ContextBookmark.Folder || param?.contextValue === ContextBookmark.File)) {
			collapsible = param?.collapsible
		} else if (param?.subs?.size ?? 0 > 0) {
			if (TreeModeBookmark.mode === TreeModeBookmark.Tree
				|| param?.contextValue === ContextBookmark.Folder
				|| param?.contextValue === ContextBookmark.File) {
				collapsible = vscode.TreeItemCollapsibleState.Collapsed
			}
		}
		return collapsible
	}

	static _handleTooltipUri(uri: vscode.Uri): string {
		if (uri.fsPath.startsWith(os.homedir())) {
			return `~${uri.fsPath.slice(os.homedir().length)}`; // Replace home directory with ~
		}
		return ''
	}


	private _setIconPath() {
		if (this.isBookmarkInvalid) {
			this.iconPath = new vscode.ThemeIcon('error', new vscode.ThemeColor(Colors.Red.id))
			return
		}
		if (this.contextValue === ContextBookmark.Watcher) {
			if (this.isOpened) {
				this.iconPath = bookmarkIcon.getIcon(IconType.watcher, 'green')
			} else {
				this.iconPath = bookmarkIcon.getIcon(IconType.watcher)
			}
			return
		}
		if (TreeModeBookmark.mode === TreeModeBookmark.Tree) {
			if (this.isOpened) {
				this.iconPath = bookmarkIcon.getIcon(IconType.open_folder, 'green')
			}
			else if (this.icon === 0) {
				if (this.subs.size > 0) {
					this.iconPath = bookmarkIcon.getIcon(IconType.folder)
				}
				else {
					this.iconPath = bookmarkIcon.getIcon(IconType.bookmark)
				}
			} else if (this.icon > 0) {
				this.iconPath = new vscode.ThemeIcon(IconSymbol[this.icon])
			}
		}

		else if (TreeModeBookmark.mode === TreeModeBookmark.File) {
			if (this.contextValue === ContextBookmark.File) {
				this.iconPath = vscode.ThemeIcon.File
			}
			else if (this.isFolder) {
				this.iconPath = vscode.ThemeIcon.Folder
			}
			else {
				this.iconPath = bookmarkIcon.getIcon(IconType.bookmark)
			}
		}

		else if (TreeModeBookmark.mode === TreeModeBookmark.All) {
			this.iconPath = bookmarkIcon.getIcon(IconType.bookmark)
		}

		else {
			this.iconPath = bookmarkIcon.getIcon(IconType.bookmark)
		}
	}

	// Json local
	public toJSON(): any {
		return {
			id: this.Id,
			label: this.label,
			path: this.path,
			line: this.start.line,
			opened: this.collapsibleState,
			subs: Array.from(this.subs).map(sub => sub.toJSON()),
			params: `${this.icon},${this.start.line},${this.start.column},${this.end.line},${this.end.column}`,
		}
	}
	public static fromJSON(data: any): Bookmark {
		const subs = new SetBookmark()
		if (data.subs && data.subs.length > 0) {
			for (const subItem of data.subs) {
				subs.add(this.fromJSON(subItem))
			}
		}

		const params = data.params.split(',').map(Number)
		const parent = new Bookmark({
			Id: data.id,
			label: data.label,
			path: data.path,
			collapsible: data.opened,
			icon: params[BookmarkParam.Icon],
			start: new CursorIndex(params[BookmarkParam.StartLine], params[BookmarkParam.StartColumn]),
			end: new CursorIndex(params[BookmarkParam.EndLine], params[BookmarkParam.EndColumn]),
		})
		for (const bm of subs) {
			bm.parent = parent
		}
		parent.subs = subs
		return parent
	}

	// Json export, import
	public toJsonExport(): any {
		return {
			id: this.Id,
			label: this.label,
			path: `__root__${path.sep}${this.path}`,
			params: `${this.icon},${this.start.line},${this.start.column},${this.end.line},${this.end.column}`,
			subs: Array.from(this.subs).map(sub => sub.toJsonExport()),
		}
	}
	public static fromJsonImport(data: any): Bookmark {
		const subs = new SetBookmark()
		if (data.subs && data.subs.length > 0) {
			for (const subItem of data.subs) {
				subs.add(this.fromJsonImport(subItem))
			}
		}

		let start: CursorIndex | undefined;
		let end: CursorIndex | undefined;
		let parent: Bookmark | undefined
		const params: number[] = []
		try {
			params.push(data.params.split(',').map(Number))
			start = new CursorIndex(params[BookmarkParam.StartLine], params[BookmarkParam.StartColumn])
			end = new CursorIndex(params[BookmarkParam.EndLine], params[BookmarkParam.EndColumn])
		} catch (error) {
			logger.error(error)
		}
		try {
			parent = new Bookmark({
				Id: data.id,
				label: data.label,
				icon: params[BookmarkParam.Icon],
				path: (data.path as string).replace(/\\/g, path.sep).replace(new RegExp(`__root__${path.sep.replace('\\', '\\\\')}`, 'g'), ''),
				collapsible: data.opened,
				start: start,
				end: end,
			})
		} catch (error) {
			logger.error(error)
		}
		for (const bm of subs) {
			bm.parent = parent
		}
		if (parent) {
			parent.subs = subs
			return parent
		} else {
			return new Bookmark({
				label: 'unknown bookmark'
			})
		}
	}


	public compareIndex(other: Bookmark): boolean {
		return this.path === other.path && this.start.line === other.start.line
	}

	public equals(other: Bookmark | undefined): boolean {
		if (!other) return false
		return this.Id === other.Id
	}

	public copyWith(param?: {
		Id?: string
		label?: string | vscode.TreeItemLabel
		path?: string
		icon?: number
		subs?: SetBookmark
		content?: string
		isOpened?: boolean
		collapsibleState?: vscode.TreeItemCollapsibleState
		parent?: Bookmark
		contextValue?: ContextBookmark
		start?: CursorIndex
		end?: CursorIndex
	}): Bookmark {
		return new Bookmark({
			Id: param?.Id ?? this.Id,
			label: param?.label ?? this.label,
			path: param?.path ?? this.path,
			subs: param?.subs ?? this.subs,
			icon: param?.icon ?? this.icon,
			content: param?.content ?? this.content,
			isOpened: param?.isOpened ?? this.isOpened,
			collapsible: param?.collapsibleState ?? this.collapsibleState,
			parent: param?.parent ?? this.parent,
			contextValue: param?.contextValue ?? this.contextValue,
			start: param?.start ?? this.start,
			end: param?.end ?? this.end,
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

	private _handleTooltip() {
		if (this.isDirectory) {
			if (this.resourceUri) this.tooltip = Bookmark._handleTooltipUri(this.resourceUri)
		} else {
			let tooltipContent = new vscode.MarkdownString();
			tooltipContent.supportThemeIcons = true
			tooltipContent.appendMarkdown(`####  📘 ${this.label}`)
			if (this.subs.size > 0) {
				tooltipContent.appendMarkdown(`\n$(type-hierarchy-sub) **${this.subs.size}**  $(debug-line-by-line): **${this.start.line + 1}** 📁: ${this.path}\n`)
			} else {
				tooltipContent.appendMarkdown(`\n$(debug-line-by-line): **${this.start.line + 1}** 📁: ${this.path}\n`)
			}
			tooltipContent.appendCodeblock(this.content ?? '', path.extname(this.path).split('.').pop())
			this.tooltip = tooltipContent
		}
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

	get isFile(): boolean {
		return this.contextValue === ContextBookmark.File
	}
	get isFolder(): boolean {
		return this.contextValue === ContextBookmark.Folder
	}
	get isDirectory(): boolean {
		return this.isFile || this.isFolder
	}
	get isWatcher(): boolean {
		return this.contextValue === ContextBookmark.Watcher
	}
	get isBookmark(): boolean {
		return this.contextValue === ContextBookmark.Bookmark
	}
	get isBookmarkInvalid(): boolean {
		return this.contextValue === ContextBookmark.BookmarkInvalid
	}
}
