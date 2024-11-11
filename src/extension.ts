'use strict'

import * as vscode from 'vscode'

import { BookmarksTreeViewProvider } from './bookmark-provider/provider/BookmarkTreeViewProvider'
import { WatcherTreeViewProvider } from './bookmark-provider/provider/WatcherTreeViewProvider'
import { buttonItemRegister } from './subscriptions/buttonItemRegister'
import { fileEditorRegister } from './subscriptions/fileEditorRegister'
import { keyboardShortcutRegister } from './subscriptions/keyboardShortcutRegister'
import { openNodeBookmarkRegister } from './subscriptions/openNodeBookmarkRegister'
import { statusBarButtonRegister } from './subscriptions/statusBarButtonRegister'
import path = require('path')
import { configurationRegister } from './subscriptions/configurationRegister'
import { BookmarksHelpAndFeedback } from './sidebar/BookmarksHelpAndFeedback'
import { createHelpAndFeedback } from './subscriptions/2_createHelpAndFeedback'
import { createTreeBookmark } from './bookmark-provider/features/bookmarks/createTreeBookmark'
import { createTreeWatcher } from './bookmark-provider/features/watchers/createTreeWatcher'
import { createTodosTree } from './bookmark-provider/features/todos/createTodosTree'
import { TodosViewProvider } from './bookmark-provider/features/todos/TodosViewProvider'


export function activate(context: vscode.ExtensionContext) {

	const bookmarkTreeProvider = new BookmarksTreeViewProvider(context)
	const watcherProvider = new WatcherTreeViewProvider(context, bookmarkTreeProvider)
	const bookmarksHelpAndFeedback = new BookmarksHelpAndFeedback()
	const todosViewProvider = new TodosViewProvider(context)
	bookmarkTreeProvider.setWatcherTreeViewProvider(watcherProvider)

	const treeViewBookmark = createTreeBookmark(context, bookmarkTreeProvider)
	createTreeWatcher(context, watcherProvider)

	fileEditorRegister(context, bookmarkTreeProvider)
	buttonItemRegister(context, bookmarkTreeProvider, watcherProvider)
	configurationRegister(context, bookmarkTreeProvider, watcherProvider)
	openNodeBookmarkRegister(context, bookmarkTreeProvider)
	statusBarButtonRegister(context, bookmarkTreeProvider, watcherProvider, treeViewBookmark)
	keyboardShortcutRegister(context, bookmarkTreeProvider)

	createTodosTree(context, todosViewProvider)

	// createHelpAndFeedback(context,bookmarksHelpAndFeedback)

	bookmarkTreeProvider.init(treeViewBookmark)
}

export function deactivate() {
}

