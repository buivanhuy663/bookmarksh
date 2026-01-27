import * as vscode from 'vscode'
import { fileHelper } from '../../../util/FileHelper'
import { logger } from '../../../util/LoggerHelper'
import { Bookmark } from "../model/Bookmark"
import { SetBookmark } from "../model/SetBookmark"
import { TreeModeBookmark } from '../shared_data/TreeMode'
import path = require("path")
import { Config } from '../shared_data/Config'

class BookmarksTreeRepository {
	async readBookmarksFromFile(context: vscode.ExtensionContext): Promise<Bookmark[]> {
		try {
			const data = fileHelper.readWorkspace(context, fileHelper.BOOKMARKS_WORKSPACE)
			if (data) {
				if (data.mode !== 1 && data.mode !== 2 && data.mode !== 3) {
					TreeModeBookmark.mode = 1
				} else {
					TreeModeBookmark.mode = data.mode
				}
				return (data as any).bookmarks.map((item: any) => Bookmark.fromJSON(item))
			} else {
				return []
			}
		} catch (error) {
			logger.error("Can't read bookmarks file")
			logger.error(error)
			return []
		}
	}

	async saveBookmarksToFile(context: vscode.ExtensionContext, bookmarks: SetBookmark): Promise<void> {
		const jsonData = bookmarks.values.map(bookmark => bookmark.toJSON())
		const jsonAll = {
			mode: TreeModeBookmark.mode,
			bookmarks: jsonData
		}
		fileHelper.writeWorkspace(context, fileHelper.BOOKMARKS_WORKSPACE, jsonAll)
		if (Config.autoBackupJson) {
			this.exportAllBookmark(bookmarks, `bookmarksh_data`, false)
		}
	}

	exportAllBookmark(bookmarks: SetBookmark, fileName: string, showInfor: boolean = true) {
		fileHelper.createDirectoryIfNotExist('.vscode')
		const jsonData = bookmarks.values.map(bookmark => bookmark.toJsonExport())
		const jsonAll = {
			mode: 'all',
			bookmarks: jsonData
		}
		if (showInfor) {
			const filePath = path.join(fileHelper.rootPath, '.vscode', fileName + '.json')
			fileHelper.writeJsonFile(filePath, jsonAll)
			logger.showMessage('All bookmarks have been exported to\n' + filePath)
		} else {
			const filePath = path.join(fileHelper.rootPath, '.vscode', fileName + '.json')
			fileHelper.writeJsonFile(filePath, jsonAll)
		}
	}

	exportBookmark(bookmark: Bookmark, fileName: string) {
		fileHelper.createDirectoryIfNotExist('.vscode')
		const jsonData = bookmark.toJsonExport()
		const jsonAll = {
			mode: 'single',
			bookmarks: jsonData
		}
		const filePath = path.join(fileHelper.rootPath, '.vscode', fileName + '.json')
		fileHelper.writeJsonFile(filePath, jsonAll)
		logger.showMessage('Bookmarks have been exported to\n' + filePath)
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
			logger.error("Can't read bookmarks file")
			logger.error(error)
			logger.showWarningMessage("Can't read bookmarks file")
			return undefined
		}
	}

	saveRegularIcon(context: vscode.ExtensionContext, icons: number[]) {
		fileHelper.writeGloble(context, fileHelper.ICONS_WORKSPACE, icons)
	}

	readRegularIcon(context: vscode.ExtensionContext): number[] {
		const data = fileHelper.readGloble(context, fileHelper.ICONS_WORKSPACE)
		if (data) {
			return data as any
		} else {
			return []
		}
	}
}

export const bookmarkRepository = new BookmarksTreeRepository()
