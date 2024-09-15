import path = require('path')
import * as vscode from 'vscode'
import { LinePath } from '../data/model/LinePath'

export class BookmarkIcon {

	static showBookmarkOnGutter(editor: vscode.TextEditor, set: Array<LinePath>) {
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
		editor.setDecorations(BookmarkIcon.bookmarkSigle, decorationSigle)
		editor.setDecorations(BookmarkIcon.bookmarkMulti, decorationMulti)
	}

	// cần sử dụng biến static để lưu giữ các icon nếu không sẽ không thể thay đổi được
	static bookmarkMulti = BookmarkIcon.getIconBookmark(true)
	static bookmarkSigle = BookmarkIcon.getIconBookmark(false)

	static getIconBookmark(multible: boolean) {
		return vscode.window.createTextEditorDecorationType({
			gutterIconPath: BookmarkIcon.getIconPath(multible ? 'bookmarks' : 'bookmark', 'mid'),
			overviewRulerLane: vscode.OverviewRulerLane.Left,
			overviewRulerColor: 'rgba(0,255,0, 0.7)', // Màu đỏ với độ mờ 70%
			border: 'none', // Không có border để tránh làm nổi bật dòng
		})
	}

	static getIconPath(icon: 'bookmark' | 'bookmarks' | 'bookmark_tag' | 'bookmark_sq' |
		'edit' | 'delete' | 'view' |
		'open_folder' | 'folder' |
		'filter_all' | 'filter_file' | 'filter_tree' |
		'remove_watcher' | 'remove_all' |
		'import_json' | 'export_json'

		, iconMode?: 'mid' | 'dark' | 'light') {
		const mode = vscode.window.activeColorTheme.kind === vscode.ColorThemeKind.Dark ? 'dark' : 'light'
		return vscode.Uri.file(path.join(__dirname, '..', '..', 'resources', iconMode ?? mode, `${icon}.svg`))
	}
}

// Dark : F6F6F6
// Light : 2d2d30