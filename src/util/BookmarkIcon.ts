import path = require('path')
import * as vscode from 'vscode'
import { Bookmark } from '../bookmark-provider/data/model/Bookmark'
import { LinePath } from '../bookmark-provider/data/model/LinePath'

export class BookmarkIcon {
	showBookmarkOnGutter(editor: vscode.TextEditor, set: Array<LinePath>) {
		const decorationSigle: vscode.DecorationOptions[] = []
		const decorationMulti: vscode.DecorationOptions[] = []
		for (const line of set) {
			const content = editor.document.lineAt(line.line)
			const range = new vscode.Range(content.range.start, content.range.end)
			if (line.ids.length > 1) {
				decorationMulti.push({ range: range })
			} else {
				decorationSigle.push({ range: range })
			}
		}
		editor.setDecorations(this._bookmarkSigle, decorationSigle)
		editor.setDecorations(this._bookmarkMulti, decorationMulti)
	}

	getIcon(icon: IconType): vscode.Uri {
		const mode = vscode.window.activeColorTheme.kind === vscode.ColorThemeKind.Dark ? 'dark' : 'light'
		return vscode.Uri.file(path.join(__dirname, '..', '..', 'resources', mode, `${icon}.svg`))
	}

	private _getIconGutter(multible: boolean) {
		return vscode.window.createTextEditorDecorationType({
			gutterIconPath: this.getIcon(multible ? IconType.bookmarks_gutter : IconType.bookmark_gutter),
			overviewRulerLane: vscode.OverviewRulerLane.Left,
			overviewRulerColor: 'rgba(0,255,0, 0.7)', // Màu đỏ với độ mờ 70%
			border: 'none', // Không có border để tránh làm nổi bật dòng
		})
	}

	// cần sử dụng biến static để lưu giữ các icon nếu không sẽ không thể thay đổi được
	private _bookmarkMulti = this._getIconGutter(true)
	private _bookmarkSigle = this._getIconGutter(false)


	getTreeItem(element: Bookmark): vscode.TreeItem {
		const treeItem = new vscode.TreeItem(element.label);

		// Set the icon based on the file name or type
		if (element.label === 'example.txt') {
			treeItem.iconPath = new vscode.ThemeIcon('file-cpp'); // Use built-in icon for text files
		} else if (element.label === 'image.png') {
			treeItem.iconPath = new vscode.ThemeIcon('file-symlink-file'); // Use a different built-in icon
		} else {
			treeItem.iconPath = new vscode.ThemeIcon('file'); // Default file icon
		}

		return treeItem;
	}
}

export enum IconType {
	bookmark_gutter = 'bookmark_gutter',
	bookmarks_gutter = 'bookmarks_gutter',
	bookmark = 'bookmark',
	bookmarks = 'bookmarks',
	watcher = 'watcher',
	open_folder = 'open_folder',
	open_folder_green = 'open_folder_green',
	folder = 'folder'
}
export const bookmarkIcon = new BookmarkIcon()

// Dark : F6F6F6
// Light : 2d2d30