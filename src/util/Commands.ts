import { TreeMode } from "../bookmark-provider/data/shared_data/TreeMode"
import { Color, Icons, KeyBinding } from "./Constant"
import { ContextBookmark } from "./ContextValue"

export class Commands {
	static readonly nameExtension = 'bookmarksh'

	static readonly editorContext = 'bookmarksh.editor.context'

	static readonly treeAsList = 'bookmarks.var.treeAsList'
	static readonly hasBookmark = 'bookmarks.var.hasBookmark'
	static readonly hasWatcher = 'bookmarks.var.hasWatcher'

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

	static bookmarkCommand = {
		// keyboard shortcut
		toggleBookmark: {
			'command': Commands.nameExtension + '.toggleBookmark',
			'title': 'Toggle Bookmark',
			'key': KeyBinding.toggleBookmark,
			"category": "Bookmarks Tree",
			'when': 'editorTextFocus',
		},
		forceAddBookmark: {
			'command': Commands.nameExtension + '.forceAddBookmark',
			'title': 'Force and Add Bookmark',
			'key': KeyBinding.forceAddBookmark,
			"category": "Bookmarks Tree",
			'when': 'editorTextFocus',
		},
		forceDeleteBookmark: {
			'command': Commands.nameExtension + '.forceDeleteBookmark',
			'title': 'Force and Delete Bookmark',
			'key': KeyBinding.forceDeleteBookmark,
			"category": "Bookmarks Tree",
			'when': 'editorTextFocus',
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
			'when': `${this.viewWatcherTreeView} && ${this.hasWatcher}`,
			'icon': Icons.remove_all,
			"category": "Bookmarks Tree",
			"group": `navigation@${this.indexStatusBarButton.removeAllWatcher}`,
		},
		removeAllBookmark: {
			'command': Commands.nameExtension + '.removeAllBookmark',
			'title': 'Delete All Bookmarks',
			'when': `${this.viewBookmarkTreeView} && ${this.hasBookmark}`,
			'icon': Icons.remove_all,
			"category": "Bookmarks Tree",
			"group": `navigation@${this.indexStatusBarButton.removeAllBookmark}`,
		},
		exportAllBookmark: {
			'command': Commands.nameExtension + '.exportAllBookmark',
			'title': 'Export All Bookmarks',
			'when': `${this.viewBookmarkTreeView} && ${this.hasBookmark}`,
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
			'command': Commands.nameExtension + '.refresh',
			'title': 'Refresh',
			'when': `${this.viewBookmarkTreeView} `,
			'icon': Icons.refresh,
			"category": "Bookmarks Tree",
			"group": `navigation@${this.indexStatusBarButton.refresh}`,
		},

		filterTree: {
			'command': Commands.nameExtension + '.filterTree',
			'title': 'View as Bookmarks Tree',
			'when': `${this.viewBookmarkTreeView} && ${this.treeAsList} == ${TreeMode.Tree}`,
			'icon': Icons.filter_tree,
			"category": "Bookmarks Tree",
			"group": `navigation@${this.indexStatusBarButton.filterTree} `,
		},
		filterFile: {
			'command': Commands.nameExtension + '.filterFile',
			'title': 'View as Bookmarks Explorer',
			'when': `${this.viewBookmarkTreeView} && ${this.treeAsList} == ${TreeMode.File}`,
			'icon': Icons.folder,
			"category": "Bookmarks Tree",
			"group": `navigation@${this.indexStatusBarButton.filterFile}`,
		},
		filterAll: {
			'command': Commands.nameExtension + '.filterAll',
			'title': 'View as List of All Bookmarks',
			'when': `${this.viewBookmarkTreeView} && ${this.treeAsList} == ${TreeMode.All}`,
			'icon': Icons.filter_all,
			"category": "Bookmarks Tree",
			"group": `navigation@${this.indexStatusBarButton.filterAll}`,
		},

		// Todo change satte
		changeStateTodo: {
			'command': Commands.nameExtension + '.changeStateTodo',
			'title': 'Change state',
			'when': `${this.viewTodosTreeView}`,
		},
	}

	static todoCommands = {
		Todo: {
			'command': Commands.nameExtension + '.todoState' + '.Todo',
			'title': "Todo",
		},
		InProgress: {
			'command': Commands.nameExtension + '.todoState' + '.InProgress',
			'title': "InProgress",
		},
		Hold: {
			'command': Commands.nameExtension + '.todoState' + '.Hold',
			'title': "Hold",
		},
	}

	static commands = {
		...this.bookmarkCommand,
		...this.todoCommands,
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



	static commandPalett = [
		{ command: this.commands.toggleBookmark.command },
		{ command: this.commands.forceAddBookmark.command },
		{ command: this.commands.forceDeleteBookmark.command },
		{ command: this.commands.removeAllBookmark.command },
		{ command: this.commands.exportAllBookmark.command },
		{ command: this.commands.importBookmark.command },
		{ command: this.commands.filterAll.command },
		{ command: this.commands.filterFile.command },
		{ command: this.commands.filterTree.command },
		{ command: this.commands.refresh.command },
		{ command: this.commands.removeAllWatcher.command },
	]

	static view_title = [
		this.commands.removeAllBookmark,
		this.commands.exportAllBookmark,
		this.commands.importBookmark,
		this.commands.filterAll,
		this.commands.filterFile,
		this.commands.filterTree,
		this.commands.refresh,
		this.commands.removeAllWatcher,
	]

	static view_item_context = [
		this.commands.pinView,
		this.commands.editBookmark,
		this.commands.deleteBookmark,
		this.commands.exportBookmark,
		this.commands.addToWatcher,
		this.commands.removeWatcher,
	]

	static bookmarksh_todo_changeState_submenu = [
		{
			"command": this.todoCommands.Todo.command,
			"group": "changeState.submenu@2"
		},
		{
			"command": this.todoCommands.InProgress.command,
			"group": "changeState.submenu@2"
		},
	]

	static configuration = {
		"type": "object",
		"title": "Auto export to json file",
		"properties": {
			"bookmarksh.enableAutoExport": {
				"type": "boolean",
				"default": false,
				"description": "If enabled. Bookmarks data will be automatically exported to a json file when there is a change."
			}
		}
	}

	static submenuChangeStateToto = [
		{

		}
	]

	static allColor = [
		Color.Todo,
		Color.InProgress,
		Color.Hold,
		Color.Warning,
		Color.Error,
		Color.Done,
		Color.NeedReview,
		Color.NeedRemove,
		Color.NeedImprove,

		Color.Red,
	]
}

