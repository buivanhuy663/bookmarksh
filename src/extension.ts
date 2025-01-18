'use strict'

import * as vscode from 'vscode'

import { WatcherTreeViewProvider } from './bookmark-provider/features/watchers/WatcherTreeViewProvider'
import { fileEditorSubscriber } from './subscriptions/fileEditorSubscriber'
import path = require('path')
import { configurationSubscriber } from './subscriptions/configurationSubscriber'
import { BookmarksHelpAndFeedback } from './bookmark-provider/features/helpAndFeedback/BookmarksHelpAndFeedback'
import { createTreeBookmark } from './bookmark-provider/features/bookmarks/createTreeBookmark'
import { createTreeWatcher } from './bookmark-provider/features/watchers/createTreeWatcher'
import { TodosViewProvider } from './bookmark-provider/features/todos/TodosViewProvider'
import { BookmarksTreeViewProvider } from './bookmark-provider/features/bookmarks/BookmarkTreeViewProvider'
import { createHelpAndFeedback } from './bookmark-provider/features/helpAndFeedback/createHelpAndFeedback'
import { todoSubscriber } from './bookmark-provider/features/todos/subscriptions/todoSubscriber'
import { bookmarkSubscriber } from './bookmark-provider/features/bookmarks/subscriptions/bookmarkSubscriber'
import { createTodosTree } from './bookmark-provider/features/todos/createTodosTree'
import { watcherSubscriber } from './bookmark-provider/features/watchers/subscriptions/watcherSubscriber'


export function activate(context: vscode.ExtensionContext) {
	// bookmark
	const bookmarkTreeProvider = new BookmarksTreeViewProvider(context)
	const watcherProvider = new WatcherTreeViewProvider(context, bookmarkTreeProvider)
	bookmarkTreeProvider.setWatcherTreeViewProvider(watcherProvider)

	// bookmark list
	const treeViewBookmark = createTreeBookmark(context, bookmarkTreeProvider)
	bookmarkSubscriber(context, bookmarkTreeProvider)

	// bookmark watcher
	createTreeWatcher(context, watcherProvider)
	watcherSubscriber(context, watcherProvider)

	// todo list
	const todosViewProvider = new TodosViewProvider(context)
	const treeViewTodo = createTodosTree(context, todosViewProvider)
	todoSubscriber(context, todosViewProvider)

	// Help and feedback
	const bookmarksHelpAndFeedback = new BookmarksHelpAndFeedback()
	createHelpAndFeedback(context, bookmarksHelpAndFeedback)

	// register common
	fileEditorSubscriber(context, bookmarkTreeProvider, todosViewProvider)
	configurationSubscriber(context)

	// init data
	bookmarkTreeProvider.init(treeViewBookmark).then(() => {
		todosViewProvider.init(treeViewTodo)
	})
}

export function deactivate() {
}

