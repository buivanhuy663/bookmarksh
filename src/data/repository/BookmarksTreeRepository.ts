import * as vscode from 'vscode'
import { BookmarksTreeViewProvider } from "../../bookmark-provider/BookmarkTreeViewProvider"
import { fileHelper } from '../../util/FileHelper'
import { logger } from '../../util/LoggerHelper'
import { Bookmark } from "../model/Bookmark"
import { SetBookmark } from "../model/SetBookmark"
import path = require("path")


class BookmarksTreeRepository {
	async readBookmarksFromFile(context: vscode.ExtensionContext): Promise<Bookmark[]> {
		try {
			const data = fileHelper.readWorkspace(context, fileHelper.BOOKMARKS_WORKSPACE)
			if (data) {
				BookmarksTreeViewProvider.treeMode = data.mode
				return (data as any).bookmarks.map((item: any) => Bookmark.parseBookmark(item))
			} else {
				return []
			}
		} catch (error) {
			console.error("Can't read bookmarks file")
			console.error(error)
			return []
		}
	}

	async saveBookmarksToFile(context: vscode.ExtensionContext, bookmarks: SetBookmark): Promise<void> {
		const jsonData = bookmarks.values.map(bookmark => bookmark.toJSON())
		const jsonAll = {
			mode: BookmarksTreeViewProvider.treeMode,
			bookmarks: jsonData
		}
		fileHelper.writeWorkspace(context, fileHelper.BOOKMARKS_WORKSPACE, jsonAll)
	}

	exportAllBookmark(bookmarks: SetBookmark) {
		const jsonData = bookmarks.values.map(bookmark => bookmark.toJSON())
		const jsonAll = {
			mode: 'all',
			bookmarks: jsonData
		}
		const rootPath = fileHelper.getRootPath()
		if (rootPath) {
			const filePath = path.join(rootPath, '.vscode', 'bookmarks.json')
			fileHelper.writeJsonFile(filePath, jsonAll)
			logger.showMessage('All bookmarks have been exported to\n' + filePath)
		}
	}

	exportBookmark(bookmark: Bookmark, fileName: string) {
		const rootPath = fileHelper.getRootPath()
		if (rootPath) {
			const jsonData = bookmark.toJSON()
			const jsonAll = {
				mode: 'single',
				bookmarks: jsonData
			}
			const filePath = path.join(rootPath, '.vscode', fileName + '.json')
			fileHelper.writeJsonFile(filePath, jsonAll)
			logger.showMessage('Bookmarks have been exported to\n' + filePath)
		}
	}

	async importBookmark(): Promise<any | undefined> {
		try {
			const fileUri = await vscode.window.showOpenDialog({
				canSelectMany: false,
				openLabel: 'Select Json File',
				filters: {
					'All Files': ['*'], // Adjust filter according to your needs
					'Text Files': ['json']
				}
			});
			if (fileUri && fileUri.length > 0) {
				const data = await fileHelper.readJsonFile(fileUri[0].fsPath);
				return data
			}
			return undefined
		} catch (error) {
			console.error("Can't read bookmarks file")
			console.error(error)
			logger.showWarningMessage("Can't read bookmarks file")
			return undefined
		}
	}
}

export const bookmarkRepository = new BookmarksTreeRepository()
