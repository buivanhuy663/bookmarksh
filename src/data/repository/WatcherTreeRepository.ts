import { fileHelper } from "../../util/FileHelper";

import * as vscode from 'vscode';

class WatcherTreeRepository {
	getWatchersFromWorkspace(context: vscode.ExtensionContext): string[] {
		try {
			const data = fileHelper.readWorkspace(context, fileHelper.WATCHER_WORKSPACE)
			if (data) {
				return data.watchers.map((w: string) => w);
			}
			return [];
		} catch (error) {
			console.error(error);
			return [];
		}
	}

	saveWatchersToWorkspace(context: vscode.ExtensionContext, watchers: Set<string>): void {
		const data = { "watchers": Array.from(watchers) };
		fileHelper.writeWorkspace(context, fileHelper.WATCHER_WORKSPACE, data);
	}
}

export const watcherRepository = new WatcherTreeRepository();