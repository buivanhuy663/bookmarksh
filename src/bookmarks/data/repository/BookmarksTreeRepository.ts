import * as vscode from 'vscode'
import { fileHelper } from '../../../util/FileHelper'
import { logger } from '../../../util/LoggerHelper'
import { Bookmark } from "../model/Bookmark"
import { SetBookmark } from "../model/SetBookmark"
import { TreeModeBookmark } from '../shared_data/TreeMode'
import path = require("path")
import { Config, StorageMode } from '../shared_data/Config'
import * as fs from 'fs'

class BookmarksTreeRepository {
	private readonly JSON_FILE_NAME = 'bookmarksh_data.json'
	private readonly STORAGE_MODE_KEY = 'bookmarksh.storageMode'

	async readBookmarksFromFile(context: vscode.ExtensionContext): Promise<Bookmark[]> {
		try {
			let data: any

			// Đọc từ JSON hoặc Workspace tùy theo mode
			if (Config.storageMode === StorageMode.JSON) {
				const jsonPath = path.join(fileHelper.rootPath, '.vscode', this.JSON_FILE_NAME)
				data = fileHelper.readJsonFile(jsonPath)
			} else {
				data = fileHelper.readWorkspace(context, fileHelper.BOOKMARKS_WORKSPACE)
			}

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

		// Lưu vào JSON hoặc Workspace tùy theo mode
		if (Config.storageMode === StorageMode.JSON) {
			fileHelper.createDirectoryIfNotExist('.vscode')
			const jsonPath = path.join(fileHelper.rootPath, '.vscode', this.JSON_FILE_NAME)
			fileHelper.writeJsonFile(jsonPath, jsonAll)
		} else {
			fileHelper.writeWorkspace(context, fileHelper.BOOKMARKS_WORKSPACE, jsonAll)

			// Chỉ backup ra JSON nếu đang ở chế độ Workspace VÀ có enable autoBackupJson
			if (Config.autoBackupJson) {
				this.exportAllBookmark(bookmarks, `bookmarksh_data`, false)
			}
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
		fileHelper.writeGlobal(context, fileHelper.ICONS_WORKSPACE, icons)
	}

	readRegularIcon(context: vscode.ExtensionContext): number[] {
		const data = fileHelper.readGlobal(context, fileHelper.ICONS_WORKSPACE)
		if (data) {
			return data as any
		} else {
			return []
		}
	}

	// Toggle storage mode và migrate data
	async toggleStorageMode(context: vscode.ExtensionContext, bookmarks: SetBookmark): Promise<void> {
		try {
			const jsonPath = path.join(fileHelper.rootPath, '.vscode', this.JSON_FILE_NAME)

			if (Config.storageMode === StorageMode.JSON) {
				// Chuyển từ JSON sang Workspace
				logger.infor('Switching from JSON to Workspace storage')

				// Lưu data vào workspace
				Config.storageMode = StorageMode.WORKSPACE
				await context.workspaceState.update(this.STORAGE_MODE_KEY, StorageMode.WORKSPACE)
				await this.saveBookmarksToFile(context, bookmarks)

				// Xóa file JSON
				if (fs.existsSync(jsonPath)) {
					fs.unlinkSync(jsonPath)
					logger.infor('Deleted JSON file: ' + jsonPath)
				}

				logger.showMessage('Storage mode switched to Workspace State')
			} else {
				// Chuyển từ Workspace sang JSON
				logger.infor('Switching from Workspace to JSON storage')

				// Lưu data vào JSON
				Config.storageMode = StorageMode.JSON
				await context.workspaceState.update(this.STORAGE_MODE_KEY, StorageMode.JSON)
				await this.saveBookmarksToFile(context, bookmarks)

				logger.showMessage('Storage mode switched to JSON File')
			}
		} catch (error) {
			logger.error('Error toggling storage mode')
			logger.error(error)
			logger.showErrorMessage('Failed to toggle storage mode')
		}
	}

	// Khởi tạo storage mode dựa vào workspace state hoặc file JSON
	initStorageMode(context: vscode.ExtensionContext): void {
		// Ưu tiên đọc từ workspace state (lưu ý: người dùng đã chọn)
		const savedMode = context.workspaceState.get<string>(this.STORAGE_MODE_KEY)

		if (savedMode) {
			Config.storageMode = savedMode as StorageMode
			logger.infor(`Initialized storage mode from saved state: ${savedMode}`)
		} else {
			// Fallback: detect dựa vào file JSON có tồn tại không
			const jsonPath = path.join(fileHelper.rootPath, '.vscode', this.JSON_FILE_NAME)
			if (fs.existsSync(jsonPath)) {
				Config.storageMode = StorageMode.JSON
				context.workspaceState.update(this.STORAGE_MODE_KEY, StorageMode.JSON)
				logger.infor('Initialized storage mode: JSON (detected from file)')
			} else {
				Config.storageMode = StorageMode.WORKSPACE
				context.workspaceState.update(this.STORAGE_MODE_KEY, StorageMode.WORKSPACE)
				logger.infor('Initialized storage mode: Workspace (default)')
			}
		}
	}
}

export const bookmarkRepository = new BookmarksTreeRepository()
