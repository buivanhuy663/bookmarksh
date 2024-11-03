import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export class BookmarksHelpAndFeedback implements vscode.TreeDataProvider<Dependency> {

	private _onDidChangeTreeData: vscode.EventEmitter<Dependency | undefined | void> = new vscode.EventEmitter<Dependency | undefined | void>();
	readonly onDidChangeTreeData: vscode.Event<Dependency | undefined | void> = this._onDidChangeTreeData.event;

	constructor() {
	}

	refresh(): void {
		this._onDidChangeTreeData.fire();
	}

	getTreeItem(element: Dependency): vscode.TreeItem {
		return element;
	}

	getChildren(element?: Dependency): Dependency[] {
		return [
			new Dependency('Get Started', 'Report an issue', 'https://github.com/buivanhuy663/bookmarksh/blob/main/README.md'),
			new Dependency('Request an enhancement', 'Report an issue', 'https://github.com/buivanhuy663/bookmarksh/issues'),
			new Dependency('Report an issue', 'Report an issue', 'https://github.com/buivanhuy663/bookmarksh/issues'),
		]
	}
}

export class Dependency extends vscode.TreeItem {

	constructor(
		public readonly label: string,
		private readonly icon: string,
		public readonly url: string,
	) {
		super(label, vscode.TreeItemCollapsibleState.None);
		// this.iconPath = this.resolveIconPath();

		this.command = {
			command: 'bookmarksh.openUrl', // Lệnh khi click vào item
			title: 'Open Url', // Tên lệnh
			arguments: [this]
		}
	}

	iconPath = {
		light: path.join(__filename, '..', '..', 'resources', 'light', 'dependency.svg'),
		dark: path.join(__filename, '..', '..', 'resources', 'dark', 'dependency.svg')
	};

	contextValue = 'dependency';
}