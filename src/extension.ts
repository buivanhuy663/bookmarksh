'use strict'

import * as vscode from 'vscode'

import { BookmarksTreeViewProvider } from './bookmark-provider/provider/BookmarkTreeViewProvider'
import { WatcherTreeViewProvider } from './bookmark-provider/provider/WatcherTreeViewProvider'
import { createTreeBookmark } from './subscriptions/0_createTreeBookmark'
import { createTreeWatcher } from './subscriptions/1_createTreeWatcher'
import { buttonItemRegister } from './subscriptions/buttonItemRegister'
import { fileEditorRegister } from './subscriptions/fileEditorRegister'
import { keyboardShortcutRegister } from './subscriptions/keyboardShortcutRegister'
import { openNodeBookmarkRegister } from './subscriptions/openNodeBookmarkRegister'
import { statusBarButtonRegister } from './subscriptions/statusBarButtonRegister'
import path = require('path')


export function activate(context: vscode.ExtensionContext) {

	const bookmarkTreeProvider = new BookmarksTreeViewProvider(context)
	const watcherProvider = new WatcherTreeViewProvider(context, bookmarkTreeProvider)
	bookmarkTreeProvider.setWatcherTreeViewProvider(watcherProvider)

	const treeViewBookmark = createTreeBookmark(context, bookmarkTreeProvider)
	createTreeWatcher(context, watcherProvider)

	fileEditorRegister(context, bookmarkTreeProvider)
	buttonItemRegister(context, bookmarkTreeProvider, watcherProvider)
	openNodeBookmarkRegister(context, bookmarkTreeProvider)
	statusBarButtonRegister(context, bookmarkTreeProvider, watcherProvider, treeViewBookmark)
	keyboardShortcutRegister(context, bookmarkTreeProvider)

	bookmarkTreeProvider.init(treeViewBookmark)
}

export function deactivate() {
}

