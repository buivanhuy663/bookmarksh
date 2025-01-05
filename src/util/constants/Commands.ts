import { TreeModeBookmark, TreeModeTodo } from "../../bookmark-provider/data/shared_data/TreeMode"
import { ContextBookmark, ContextTodo } from "../ContextValue"
import { Icons } from "./Icons"

class When {
	static readonly editorTextFocus = 'editorTextFocus'
}

export class Commands {
	static readonly nameExtension = 'bookmarksh'
	static readonly nameBookmark = '.bookmark'
	static readonly nameTodo = '.todo'

	static readonly editorContextSubmenu = 'bookmarksh.editor.context'
	static readonly submenu_changeStateTodo = 'bookmarksh.todo.changeState.submenu'

	static readonly varBookmarkTreeAsList = 'bookmarks.var.bookmark.treeAsList'
	static readonly varHasBookmark = 'bookmarks.var.bookmark.hasBookmark'
	static readonly varHasWatcher = 'bookmarks.var.bookmark.hasWatcher'

	static readonly varTodoTreeAsList = 'bookmarks.var.todo.treeAsList'



	static get watcherTreeViewName() { return Commands.nameExtension + 'WatcherTree' }
	static get bookmarkTreeViewName() { return Commands.nameExtension + 'TreeView' }
	static get helpAndFeedbackTreeViewName() { return Commands.nameExtension + 'HelpAndFeedback' }
	static get todosTreeViewName() { return Commands.nameExtension + 'Todos' }

	static get openBookmark() { return Commands.nameExtension + '.openBookmark' }
	static get openTodo() { return Commands.nameExtension + '.openTodo' }

	static viewBookmarkTreeView = `(view == ${this.bookmarkTreeViewName})`
	static viewWatcherTreeView = `(view == ${this.watcherTreeViewName})`
	static viewTodosTreeView = `(view == ${this.todosTreeViewName})`
	static bookmarkOnTree = `(viewItem == ${ContextBookmark.Bookmark} || viewItem == ${ContextBookmark.Watcher} || viewItem == ${ContextBookmark.BookmarkFolder} || viewItem == ${ContextBookmark.BookmarkInvalid}}) `
	static bookmarkOnAll = `(viewItem == ${ContextBookmark.Bookmark} || viewItem == ${ContextBookmark.Watcher}) `
	static todoChangeState = `(viewItem == ${ContextTodo.Todo})`
	static bookmarkOrWatcherView = `(${this.viewBookmarkTreeView} || ${this.viewWatcherTreeView})`

	static indexStatusBarButton = {
		removeAllWatcher: 1,
		removeAllBookmark: 1,
		exportAllBookmark: 2,
		importBookmark: 3,
		filterAll: 4,
		filterFile: 4,
		filterTree: 4,
		refresh: 7,
	}

	static indexStatusBarTodoButton = {
		removeAllWatcher: 1,
		removeAllBookmark: 1,
		exportAllBookmark: 2,
		importBookmark: 3,
		filterAll: 4,
		filterFile: 4,
		filterTree: 4,
		refresh: 7,
	}

	static bookmarkCommands = {
		// keyboard shortcut
		toggleBookmark: {
			'command': Commands.nameExtension + '.toggleBookmark',
			'title': 'Toggle Bookmark',
			'key': 'ctrl+alt+h',
			"category": "Bookmarks Tree",
			'when': When.editorTextFocus,
		},
		forceAddBookmark: {
			'command': Commands.nameExtension + '.forceAddBookmark',
			'title': 'Force and Add Bookmark',
			'key': 'ctrl+alt+shift+h',
			"category": "Bookmarks Tree",
			'when': When.editorTextFocus,
		},
		forceDeleteBookmark: {
			'command': Commands.nameExtension + '.forceDeleteBookmark',
			'title': 'Force and Delete Bookmark',
			'key': 'ctrl+alt+shift+d',
			"category": "Bookmarks Tree",
			'when': When.editorTextFocus,
		},

		// Button on item
		deleteBookmark: {
			'command': Commands.nameExtension + '.deleteBookmark',
			'title': 'Delete',
			'icon': Icons.delete,
			'when': `${this.bookmarkOrWatcherView} && ${this.bookmarkOnTree}`,
			'group': 'inline@4'
		},
		editBookmark: {
			'command': Commands.nameExtension + '.editBookmark',
			'title': 'Edit Label',
			'icon': Icons.edit,
			'when': `${this.bookmarkOrWatcherView} && ${this.bookmarkOnTree}`,
			'group': 'inline@3'
		},
		pinView: {
			'command': Commands.nameExtension + '.pinView',
			'title': 'View/UnView',
			'icon': Icons.open_folder,
			'when': `${this.bookmarkOrWatcherView} && ${this.bookmarkOnAll}`,
			'group': 'inline@2'
		},
		removeWatcher: {
			'command': Commands.nameExtension + '.removeWatcher',
			'title': 'Remove watcher',
			'icon': Icons.remove_watcher,
			'when': `${this.viewWatcherTreeView}  && viewItem == ${ContextBookmark.Watcher}`,
			'group': 'inline@1'
		},
		exportBookmark: {
			'command': Commands.nameExtension + '.exportBookmark',
			'title': 'Export Bookmark',
			'when': `${this.viewBookmarkTreeView} && ${this.bookmarkOnTree}`,
		},
		addToWatcher: {
			'command': Commands.nameExtension + '.addToWatcher',
			'title': 'Add To Watcher',
			'when': `${this.viewBookmarkTreeView} && ${this.bookmarkOnTree}`,
		},

		// Top Bar Buttons
		removeAllWatcher: {
			'command': Commands.nameExtension + '.removeAllWatcher',
			'title': 'Remove All Watchers',
			'when': `${this.viewWatcherTreeView} && ${this.varHasWatcher}`,
			'icon': Icons.remove_all,
			"category": "Bookmarks Tree",
			"group": `navigation@${this.indexStatusBarButton.removeAllWatcher}`,
		},
		removeAllBookmark: {
			'command': Commands.nameExtension + '.removeAllBookmark',
			'title': 'Delete All Bookmarks',
			'when': `${this.viewBookmarkTreeView} && ${this.varHasBookmark}`,
			'icon': Icons.remove_all,
			"category": "Bookmarks Tree",
			"group": `navigation@${this.indexStatusBarButton.removeAllBookmark}`,
		},
		exportAllBookmark: {
			'command': Commands.nameExtension + '.exportAllBookmark',
			'title': 'Export All Bookmarks',
			'when': `${this.viewBookmarkTreeView} && ${this.varHasBookmark}`,
			'icon': Icons.export_json,
			"category": "Bookmarks Tree",
			"group": `navigation@${this.indexStatusBarButton.exportAllBookmark}`,
		},
		importBookmark: {
			'command': Commands.nameExtension + '.importBookmark',
			'title': 'Import Bookmark',
			'when': `${this.viewBookmarkTreeView} `,
			'icon': Icons.import_json,
			"category": "Bookmarks Tree",
			"group": `navigation@${this.indexStatusBarButton.importBookmark}`,
		},
		refresh: {
			'command': Commands.nameExtension + Commands.nameBookmark + '.refresh',
			'title': 'Refresh',
			'when': `${this.viewBookmarkTreeView} `,
			'icon': Icons.refresh,
			"category": "Bookmarks Tree",
			"group": `navigation@${this.indexStatusBarButton.refresh}`,
		},

		filterTree: {
			'command': Commands.nameExtension + Commands.nameBookmark + '.filterTree',
			'title': 'View as Bookmarks Tree',
			'when': `${this.viewBookmarkTreeView} && ${this.varBookmarkTreeAsList} == ${TreeModeBookmark.Tree}`,
			'icon': Icons.filter_tree,
			"category": "Bookmarks Tree",
			"group": `navigation@${this.indexStatusBarButton.filterTree} `,
		},
		filterFile: {
			'command': Commands.nameExtension + Commands.nameBookmark + '.filterFile',
			'title': 'View as Bookmarks Explorer',
			'when': `${this.viewBookmarkTreeView} && ${this.varBookmarkTreeAsList} == ${TreeModeBookmark.File}`,
			'icon': Icons.folder,
			"category": "Bookmarks Tree",
			"group": `navigation@${this.indexStatusBarButton.filterFile}`,
		},
		filterAll: {
			'command': Commands.nameExtension + Commands.nameBookmark + '.filterAll',
			'title': 'View as List of All Bookmarks',
			'when': `${this.viewBookmarkTreeView} && ${this.varBookmarkTreeAsList} == ${TreeModeBookmark.All}`,
			'icon': Icons.filter_all,
			"category": "Bookmarks Tree",
			"group": `navigation@${this.indexStatusBarButton.filterAll}`,
		},
	}

	static todoCommands = {
		refresh: {
			'command': Commands.nameExtension + Commands.nameTodo + '.refresh',
			'title': 'Refresh',
			'when': `${this.viewTodosTreeView} `,
			'icon': Icons.refresh,
			"category": "Todos Tree",
			"group": `navigation@${this.indexStatusBarTodoButton.refresh}`,
		},

		filterTree: {
			'command': Commands.nameExtension + Commands.nameTodo + '.filterTree',
			'title': 'View as Todo Tree',
			'when': `${this.viewTodosTreeView} && ${this.varTodoTreeAsList} == ${TreeModeTodo.Tree}`,
			'icon': Icons.filter_tree,
			"category": "Todo Tree",
			"group": `navigation@${this.indexStatusBarButton.filterTree} `,
		},
		filterFile: {
			'command': Commands.nameExtension + Commands.nameTodo + '.filterFile',
			'title': 'View as Todo Explorer',
			'when': `${this.viewTodosTreeView} && ${this.varTodoTreeAsList} == ${TreeModeTodo.File}`,
			'icon': Icons.folder,
			"category": "Todo Tree",
			"group": `navigation@${this.indexStatusBarButton.filterFile}`,
		},
		filterAll: {
			'command': Commands.nameExtension + Commands.nameTodo + '.filterAll',
			'title': 'View as List of All Todo',
			'when': `${this.viewTodosTreeView} && ${this.varTodoTreeAsList} == ${TreeModeTodo.All}`,
			'icon': Icons.filter_all,
			"category": "Todo Tree",
			"group": `navigation@${this.indexStatusBarButton.filterAll}`,
		},

		Todo: {
			'command': Commands.nameExtension + '.todoState' + '.Todo',
			'title': "Todo",
		},
		InProgress: {
			'command': Commands.nameExtension + '.todoState' + '.InProgress',
			'title': "In-Progress",
		},
		Hold: {
			'command': Commands.nameExtension + '.todoState' + '.Hold',
			'title': "Hold",
		},
		Warning: {
			'command': Commands.nameExtension + '.todoState' + '.Warning',
			'title': "Warning",
		},
		Error: {
			'command': Commands.nameExtension + '.todoState' + '.Error',
			'title': "Error",
		},
		Done: {
			'command': Commands.nameExtension + '.todoState' + '.Done',
			'title': "Done",
		},
		NeedReview: {
			'command': Commands.nameExtension + '.todoState' + '.NeedReview',
			'title': "Need-Review",
		},
		NeedRemove: {
			'command': Commands.nameExtension + '.todoState' + '.NeedRemove',
			'title': "Need-Remove",
		},
		NeedImprove: {
			'command': Commands.nameExtension + '.todoState' + '.NeedImprove',
			'title': "Need-Improve",
		},
	}

	static bookmarksh = [
		{
			"id": Commands.bookmarkTreeViewName,
			"name": "Bookmarks"
		},
		{
			"id": Commands.watcherTreeViewName,
			"name": "Watcher"
		},
		{
			"id": Commands.todosTreeViewName,
			"name": "Todos"
		},
		{
			"id": Commands.helpAndFeedbackTreeViewName,
			"name": "Help And Feedback"
		},
	]

	static submenus = [
		{
			"id": this.editorContextSubmenu,
			"label": "Bookmarks Tree"
		},
		{
			"id": this.submenu_changeStateTodo,
			"label": "Change state"
		}
	]

	static commandPalett = [
		{ command: this.bookmarkCommands.toggleBookmark.command },
		{ command: this.bookmarkCommands.forceAddBookmark.command },
		{ command: this.bookmarkCommands.forceDeleteBookmark.command },
		{ command: this.bookmarkCommands.removeAllBookmark.command },
		{ command: this.bookmarkCommands.exportAllBookmark.command },
		{ command: this.bookmarkCommands.importBookmark.command },
		{ command: this.bookmarkCommands.filterAll.command },
		{ command: this.bookmarkCommands.filterFile.command },
		{ command: this.bookmarkCommands.filterTree.command },
		{ command: this.bookmarkCommands.refresh.command },
		{ command: this.bookmarkCommands.removeAllWatcher.command },
		{ command: this.todoCommands.refresh.command },
	]

	static view_title = [
		this.bookmarkCommands.removeAllBookmark,
		this.bookmarkCommands.exportAllBookmark,
		this.bookmarkCommands.importBookmark,
		this.bookmarkCommands.filterAll,
		this.bookmarkCommands.filterFile,
		this.bookmarkCommands.filterTree,
		this.bookmarkCommands.refresh,
		this.bookmarkCommands.removeAllWatcher,

		this.todoCommands.refresh,
		this.todoCommands.filterTree,
		this.todoCommands.filterAll,
		this.todoCommands.filterFile,
	]

	static view_item_context = [
		this.bookmarkCommands.pinView,
		this.bookmarkCommands.editBookmark,
		this.bookmarkCommands.deleteBookmark,
		this.bookmarkCommands.exportBookmark,
		this.bookmarkCommands.addToWatcher,
		this.bookmarkCommands.removeWatcher,
		{
			submenu: this.submenu_changeStateTodo,
			'when': `${this.viewTodosTreeView} && ${this.todoChangeState}`
		}
	]

	static editor_context = [
		{
			submenu: this.editorContextSubmenu,
			group: "bookmarksh"
		}
	]

	static submenu_bookmarksh_editor_context = [
		{
			"command": this.bookmarkCommands.toggleBookmark.command,
			"group": "bookmarksh.editor@1",
			"when": this.bookmarkCommands.forceAddBookmark.when
		},
		{
			"command": this.bookmarkCommands.forceAddBookmark.command,
			"group": "bookmarksh.editor@2",
			"when": this.bookmarkCommands.forceAddBookmark.when
		},
		{
			"command": this.bookmarkCommands.forceDeleteBookmark.command,
			"group": "bookmarksh.editor@3",
			"when": this.bookmarkCommands.forceAddBookmark.when
		}
	]

	static submenu_bookmarksh_todo_changeState = [
		{
			"command": this.todoCommands.Todo.command,
			"group": "changeState.submenu@1"
		},
		{
			"command": this.todoCommands.InProgress.command,
			"group": "changeState.submenu@2"
		},
		{
			"command": this.todoCommands.Hold.command,
			"group": "changeState.submenu@3"
		},
		{
			"command": this.todoCommands.Warning.command,
			"group": "changeState.submenu@4"
		},
		{
			"command": this.todoCommands.Error.command,
			"group": "changeState.submenu@5"
		},
		{
			"command": this.todoCommands.Done.command,
			"group": "changeState.submenu@6"
		},
		{
			"command": this.todoCommands.NeedReview.command,
			"group": "changeState.submenu@7"
		},
		{
			"command": this.todoCommands.NeedRemove.command,
			"group": "changeState.submenu@8"
		},
		{
			"command": this.todoCommands.NeedImprove.command,
			"group": "changeState.submenu@9"
		},
	]

	static configuration = [
		{
			"type": "object",
			"title": "Auto export to json file",
			"properties": {
				"bookmarksh.enableAutoExport": {
					"type": "boolean",
					"default": false,
					"description": "If enabled. Bookmarks data will be automatically exported to a json file when there is a change."
				}
			}
		},
		{
			"type": "object",
			"title": "Todo list support",
			"properties": {
				"bookmarksh.todoListSupport": {
					"type": "string",
					"default": "txt, py, js, mjs, jsx, java, c, cpp, hpp, h, cs, php, phtml, swift, rb, go, ts, tsx, m, h, kt, kts, lua, scala, rs, sh, bash, zsh, pl, hs, ex, exs, dart",
					"description": "Add the extensions you want todo list to support. Separated by ',' "
				}
			}
		}
	]

	static keybindings = [
		this.bookmarkCommands.toggleBookmark,
		this.bookmarkCommands.forceAddBookmark,
		this.bookmarkCommands.forceDeleteBookmark,
	]
}
