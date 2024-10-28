
import * as vscode from 'vscode'
import { Bookmark } from '../bookmark-provider/data/model/Bookmark'
import { BookmarksTreeViewProvider } from '../bookmark-provider/provider/BookmarkTreeViewProvider'
import { WatcherTreeViewProvider } from '../bookmark-provider/provider/WatcherTreeViewProvider'
import { Commands } from '../util/Commands'


export function configurationRegister(context: vscode.ExtensionContext,
	treeDataProvider: BookmarksTreeViewProvider,
	watcherDataProvider: WatcherTreeViewProvider,
) {

	const enableAutoExport = vscode.workspace.onDidChangeConfiguration(event => {
		// Check if the specific configuration was changed
		if (event.affectsConfiguration('bookmarksh.enableAutoExport')) {
			const config = vscode.workspace.getConfiguration('bookmarksh');
			const isFeatureEnabled = config.get('enableAutoExport');

			switch (isFeatureEnabled) {
				case true:
					// Code to execute when the feature is enabled
					vscode.window.showInformationMessage('Feature is enabled.');
					break;
				case false:
					// Code to execute when the feature is disabled
					vscode.window.showInformationMessage('Feature is disabled.');
					break;
			}
		}
	})

	context.subscriptions.push(
		enableAutoExport,
	)
}
