
import * as vscode from 'vscode'
import { Config } from '../bookmarks/data/shared_data/Config'
import { todoSupportEx } from '../bookmarks/data/model/todo/todoSupportEx'

export function configurationSubscriber(context: vscode.ExtensionContext,
) {
	configurationBookmark.config(context)
	// configurationTodo.config(context)

	const onDidChange = vscode.workspace.onDidChangeConfiguration(event => {
		configurationBookmark.onDidChange(event)
		// configurationTodo.onDidChange(event)
	})

	context.subscriptions.push(
		onDidChange,
	)
}

class ConfigurationBookmark implements IConfiguration {
	config(context: vscode.ExtensionContext): void {
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
	}
	onDidChange(event: vscode.ConfigurationChangeEvent): void {
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
	}
}
const configurationBookmark = new ConfigurationBookmark()

class ConfigurationTodo implements IConfiguration {
	config(context: vscode.ExtensionContext): void {
		const todoListSupport = vscode.workspace.getConfiguration('bookmarksh').get('todoListSupport');
		todoSupportEx.clear();
		(todoListSupport as string).split(',').map((e) => { return `.${e.trim()}` }).forEach((ex) => {
			todoSupportEx.add(ex)
		})
	}
	onDidChange(event: vscode.ConfigurationChangeEvent): void {
		if (event.affectsConfiguration('bookmarksh.todoListSupport')) {
			const todoListSupport = vscode.workspace.getConfiguration('bookmarksh').get('todoListSupport');
			todoSupportEx.clear();
			(todoListSupport as string).split(',').map((e) => { return `.${e}` }).forEach((ex) => {
				todoSupportEx.add(ex)
			})
		}
	}
}
const configurationTodo = new ConfigurationTodo()

interface IConfiguration {
	config(context: vscode.ExtensionContext): void;
	onDidChange(event: vscode.ConfigurationChangeEvent): void;
}
