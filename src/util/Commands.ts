import { Icons, KeyBinding } from "./Constant"

export class Commands {
	static readonly nameExtension = 'bookmarksh'

	static get watcherTreeView() { return Commands.nameExtension + 'WatcherTree' }
	static get bookmarkTreeView() { return Commands.nameExtension + 'TreeView' }
	static get openBookmark() { return Commands.nameExtension + '.openBookmark' }

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
			'when': `view == ${this.bookmarkTreeView} || view == ${this.watcherTreeView}`,
			'group': 'inline@4'
		},
		editBookmark: {
			'command': Commands.nameExtension + '.editBookmark',
			'title': 'Edit Label',
			'icon': Icons.edit,
			'when': `view == ${this.bookmarkTreeView} || view == ${this.watcherTreeView}`,
			'group': 'inline@3'
		},
		pinView: {
			'command': Commands.nameExtension + '.pinView',
			'title': 'View/UnView',
			'icon': Icons.open_folder,
			'when': `view == ${this.bookmarkTreeView} || view == ${this.watcherTreeView}`,
			'group': 'inline@2'
		},
		removeWatcher: {
			'command': Commands.nameExtension + '.removeWatcher',
			'title': 'Remove watcher',
			'icon': Icons.remove_watcher,
			'when': `view == ${this.watcherTreeView} && viewItem == watcher`,
			'group': 'inline@1'
		},
		exportBookmark: {
			'command': Commands.nameExtension + '.exportBookmark',
			'title': 'Export Bookmark',
			'when': `view == ${this.bookmarkTreeView}`,
		},
		addToWatcher: {
			'command': Commands.nameExtension + '.addToWatcher',
			'title': 'Add To Watcher',
			'when': `view == ${this.bookmarkTreeView}`,
		},

		// Top Bar Buttons
		removeAllWatcher: {
			'command': Commands.nameExtension + '.removeAllWatcher',
			'title': 'Refresh',
			'when': `view == ${this.watcherTreeView}`,
			'icon': Icons.remove_all,
			"group": "navigation@1",
		},
		refresh: {
			'command': Commands.nameExtension + '.refresh',
			'title': 'Refresh',
			'when': `view == ${this.bookmarkTreeView}`,
			'icon': Icons.refresh,
			"group": "navigation@6",
		},
		filterTree: {
			'command': Commands.nameExtension + '.filterTree',
			'title': 'Show bookmark tree',
			'when': `view == ${this.bookmarkTreeView}`,
			'icon': Icons.filter_tree,
			"group": "navigation@5",
		},
		filterFile: {
			'command': Commands.nameExtension + '.filterFile',
			'title': 'Filter follow file',
			'when': `view == ${this.bookmarkTreeView}`,
			'icon': Icons.filter_file,
			"group": "navigation@4",
		},
		filterAll: {
			'command': Commands.nameExtension + '.filterAll',
			'title': 'Show List All Bookmarks',
			'when': `view == ${this.bookmarkTreeView}`,
			'icon': Icons.filter_all,
			"group": "navigation@3",
		},
		importBookmark: {
			'command': Commands.nameExtension + '.importBookmark',
			'title': 'Import Bookmark',
			'when': `view == ${this.bookmarkTreeView}`,
			'icon': Icons.import_json,
			"group": "navigation@2",
		},
		exportAllBookmark: {
			'command': Commands.nameExtension + '.exportAllBookmark',
			'title': 'Export All Bookmarks',
			'when': `view == ${this.bookmarkTreeView}`,
			'icon': Icons.export_json,
			"group": "navigation@1",
		},
	}

	static bookmarksh = [
		{
			"id": Commands.bookmarkTreeView,
			"name": "Bookmarks"
		},
		{
			"id": Commands.watcherTreeView,
			"name": "Watcher"
		}
	]
}
