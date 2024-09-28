import { Icons, KeyBinding } from "./Constant"

export class Commands {
	static readonly nameExtension = 'bookmarksh'

	static get watcherTreeViewName() { return Commands.nameExtension + 'WatcherTree' }
	static get bookmarkTreeViewName() { return Commands.nameExtension + 'TreeView' }
	static get openBookmark() { return Commands.nameExtension + '.openBookmark' }

	static viewBookmarkTreeView = `(view == ${this.bookmarkTreeViewName})`
	static viewWatcherTreeView = `(view == ${this.watcherTreeViewName})`
	static bookmarkOrWatcherItem = '(viewItem == bookmark || viewItem == watcher)'
	static bookmarkOrWatcherView = `(${this.viewBookmarkTreeView} || ${this.viewWatcherTreeView})`

	static indexStatusBarButton = {
		removeAllWatcher: 1,
		removeAllBookmark: 1,
		exportAllBookmark: 2,
		importBookmark: 3,
		filterAll: 4,
		filterFile: 5,
		filterTree: 6,
		refresh: 7,
	}

	static commands = {
		// keyboard shortcut
		toggleBookmark: {
			'command': Commands.nameExtension + '.toggleBookmark',
			'title': 'Toggle Bookmark',
			'key': KeyBinding.toggleBookmark,
			'when': 'editorTextFocus',
		},
		forkAddBookmark: {
			'command': Commands.nameExtension + '.forkAddBookmark',
			'title': 'Fork and Add Bookmark',
			'key': KeyBinding.forkAddBookmark,
			'when': 'editorTextFocus',
		},
		forkDeleteBookmark: {
			'command': Commands.nameExtension + '.forkDeleteBookmark',
			'title': 'Fork and Delete Bookmark',
			'key': KeyBinding.forkDeleteBookmark,
			'when': 'editorTextFocus',
		},

		// Button on item
		deleteBookmark: {
			'command': Commands.nameExtension + '.deleteBookmark',
			'title': 'Delete',
			'icon': Icons.delete,
			'when': `${this.bookmarkOrWatcherView} && ${this.bookmarkOrWatcherItem}`,
			'group': 'inline@4'
		},
		editBookmark: {
			'command': Commands.nameExtension + '.editBookmark',
			'title': 'Edit Label',
			'icon': Icons.edit,
			'when': `${this.bookmarkOrWatcherView} && ${this.bookmarkOrWatcherItem}`,
			'group': 'inline@3'
		},
		pinView: {
			'command': Commands.nameExtension + '.pinView',
			'title': 'View/UnView',
			'icon': Icons.open_folder,
			'when': `${this.bookmarkOrWatcherView} && ${this.bookmarkOrWatcherItem}`,
			'group': 'inline@2'
		},
		removeWatcher: {
			'command': Commands.nameExtension + '.removeWatcher',
			'title': 'Remove watcher',
			'icon': Icons.remove_watcher,
			'when': `${this.viewWatcherTreeView}  && viewItem == watcher`,
			'group': 'inline@1'
		},
		exportBookmark: {
			'command': Commands.nameExtension + '.exportBookmark',
			'title': 'Export Bookmark',
			'when': `${this.viewBookmarkTreeView} && ${this.bookmarkOrWatcherItem}`,
		},
		addToWatcher: {
			'command': Commands.nameExtension + '.addToWatcher',
			'title': 'Add To Watcher',
			'when': `${this.viewBookmarkTreeView} && ${this.bookmarkOrWatcherItem}`,
		},

		// Top Bar Buttons
		removeAllWatcher: {
			'command': Commands.nameExtension + '.removeAllWatcher',
			'title': 'Refresh',
			'when': `${this.viewWatcherTreeView} `,
			'icon': Icons.remove_all,
			"group": `navigation@${this.indexStatusBarButton.removeAllWatcher}`,
		},
		removeAllBookmark: {
			'command': Commands.nameExtension + '.removeAllBookmark',
			'title': 'Delete All Bookmarks',
			'when': `${this.viewBookmarkTreeView} `,
			'icon': Icons.remove_all,
			"group": `navigation@${this.indexStatusBarButton.removeAllBookmark}`,
		},
		exportAllBookmark: {
			'command': Commands.nameExtension + '.exportAllBookmark',
			'title': 'Export All Bookmarks',
			'when': `${this.viewBookmarkTreeView} `,
			'icon': Icons.export_json,
			"group": `navigation@${this.indexStatusBarButton.exportAllBookmark}`,
		},
		importBookmark: {
			'command': Commands.nameExtension + '.importBookmark',
			'title': 'Import Bookmark',
			'when': `${this.viewBookmarkTreeView} `,
			'icon': Icons.import_json,
			"group": `navigation@${this.indexStatusBarButton.importBookmark}`,
		},
		refresh: {
			'command': Commands.nameExtension + '.refresh',
			'title': 'Refresh',
			'when': `${this.viewBookmarkTreeView} `,
			'icon': Icons.refresh,
			"group": `navigation@${this.indexStatusBarButton.refresh}`,
		},
		filterTree: {
			'command': Commands.nameExtension + '.filterTree',
			'title': 'Show bookmark tree',
			'when': `${this.viewBookmarkTreeView} `,
			'icon': Icons.filter_tree,
			"group": `navigation@${this.indexStatusBarButton.filterTree}`,
		},
		filterFile: {
			'command': Commands.nameExtension + '.filterFile',
			'title': 'Filter follow file',
			'when': `${this.viewBookmarkTreeView} `,
			'icon': Icons.filter_file,
			"group": `navigation@${this.indexStatusBarButton.filterFile}`,
		},
		filterAll: {
			'command': Commands.nameExtension + '.filterAll',
			'title': 'Show List All Bookmarks',
			'when': `${this.viewBookmarkTreeView} `,
			'icon': Icons.filter_all,
			"group": `navigation@${this.indexStatusBarButton.filterAll}`,
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
		}
	]
}
