'use strict'

import * as vscode from 'vscode'

import { fileEditorSubscriber } from './subscriptions/fileEditorSubscriber'
import path = require('path')
import { configurationSubscriber } from './subscriptions/configurationSubscriber'
import { TodosViewProvider } from './bookmarks/features/todos/TodosViewProvider'
import { BookmarksTreeViewProvider } from './bookmarks/features/bookmarks/BookmarkTreeViewProvider'
import { createTreeBookmark } from './bookmarks/features/bookmarks/createTreeBookmark'
import { bookmarkSubscriber } from './bookmarks/features/bookmarks/subscriptions/bookmarkSubscriber'
import { BookmarksHelpAndFeedback } from './bookmarks/features/helpAndFeedback/BookmarksHelpAndFeedback'
import { createHelpAndFeedback } from './bookmarks/features/helpAndFeedback/createHelpAndFeedback'
import { createTreeWatcher } from './bookmarks/features/watchers/createTreeWatcher'
import { watcherSubscriber } from './bookmarks/features/watchers/subscriptions/watcherSubscriber'
import { WatcherTreeViewProvider } from './bookmarks/features/watchers/WatcherTreeViewProvider'


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

	// // todo list
	const todosViewProvider = new TodosViewProvider(context)
	// const treeViewTodo = createTodosTree(context, todosViewProvider)
	// todoSubscriber(context, todosViewProvider)

	// Help and feedback
	const bookmarksHelpAndFeedback = new BookmarksHelpAndFeedback()
	createHelpAndFeedback(context, bookmarksHelpAndFeedback)

	// register common
	fileEditorSubscriber(context,
		bookmarkTreeProvider,
		todosViewProvider,
	)
	configurationSubscriber(context)

	// init data
	bookmarkTreeProvider.init(treeViewBookmark).then(() => {
		// todosViewProvider.init(treeViewTodo)
	})
}

export function deactivate() {
}

