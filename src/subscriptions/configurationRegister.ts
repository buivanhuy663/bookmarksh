
import * as vscode from 'vscode'
import { WatcherTreeViewProvider } from '../bookmark-provider/features/watchers/WatcherTreeViewProvider'
import { Config } from '../bookmark-provider/data/shared_data/Config'
import { BookmarksTreeViewProvider } from '../bookmark-provider/features/bookmarks/BookmarkTreeViewProvider'

export function configurationRegister(context: vscode.ExtensionContext,
	treeDataProvider: BookmarksTreeViewProvider,
	watcherDataProvider: WatcherTreeViewProvider,
) {
	const initEnableAutoExport = vscode.workspace.getConfiguration('bookmarksh').get('enableAutoExport');
	switch (initEnableAutoExport) {
		case true:
			Config.autoBackupJson = true
			// vscode.window.showInformationMessage('enableAutoExport is enabled.');
			break;
		case false:
			Config.autoBackupJson = false
			// vscode.window.showInformationMessage('enableAutoExport is disabled.');
			break;
	}

	const enableAutoExport = vscode.workspace.onDidChangeConfiguration(event => {
		if (event.affectsConfiguration('bookmarksh.enableAutoExport')) {
			const enableAutoExport = vscode.workspace.getConfiguration('bookmarksh').get('enableAutoExport');

			switch (enableAutoExport) {
				case true:
					Config.autoBackupJson = true
					// vscode.window.showInformationMessage('enableAutoExport is enabled.');
					break;
				case false:
					Config.autoBackupJson = false
					// vscode.window.showInformationMessage('enableAutoExport is disabled.');
					break;
			}
		}
	})

	context.subscriptions.push(
		enableAutoExport,
	)
}
