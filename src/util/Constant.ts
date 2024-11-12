import { Commands } from "./Commands"

export class KeyBinding {
	static readonly toggleBookmark = 'ctrl+alt+h'
	static readonly forceAddBookmark = 'ctrl+alt+shift+h'
	static readonly forceDeleteBookmark = 'ctrl+alt+shift+d'
}

export class Color {
	static readonly prefix = 'bookmarksh.color.'
	static readonly value = {
		red : '#ff0000',
		yellow : '#ffff00',
		green : '#00ff00',
		blue : '#009eff',
	}
	static readonly Todo = {
		id: this.prefix + 'Todo',
		defaults: { dark: this.value.green, light: this.value.green },
		description: "green",
	}
	static readonly InProgress = {
		id: this.prefix + 'InProgress',
		defaults: { dark: this.value.yellow, light: this.value.yellow},
		description: "green",
	}
	static readonly Hold = {
		id: this.prefix + 'Hold',
		defaults: { dark: this.value.blue, light: this.value.blue },
		description: "green",
	}
	static readonly Warning = {
		id: this.prefix + 'Warning',
		defaults: { dark: this.value.yellow, light: this.value.yellow },
		description: "green",
	}
	static readonly Error = {
		id: this.prefix + 'Error',
		defaults: { dark: this.value.red, light: this.value.red },
		description: "green",
	}
	static readonly Done = {
		id: this.prefix + 'Done',
		defaults: { dark: this.value.green, light: this.value.green },
		description: "green",
	}
	static readonly NeedReview = {
		id: this.prefix + 'NeedReview',
		defaults: { dark: this.value.blue, light: this.value.blue },
		description: "green",
	}
	static readonly NeedRemove = {
		id: this.prefix + 'NeedRemove',
		defaults: { dark: this.value.red, light: this.value.red },
		description: "green",
	}
	static readonly NeedImprove = {
		id: this.prefix + 'NeedImprove',
		defaults: { dark: this.value.yellow, light: this.value.yellow },
		description: "green",
	}
}

export class Icons {
	private static readonly light = 'resources/light/'
	private static readonly dark = 'resources/dark/'

	static icon(name: string) {
		return {
			light: `${Icons.light}${name}.svg`,
			dark: `${Icons.dark}${name}.svg`,
		}
	}

	static readonly bookmark = this.icon('bookmark')
	static readonly bookmarks = this.icon('bookmarks')
	static readonly bookmark_tag = this.icon('bookmark_tag')
	static readonly bookmark_sq = this.icon('bookmark_sq')
	static readonly folder = this.icon('folder')
	static readonly edit = this.icon('edit')
	static readonly delete = this.icon('delete')
	static readonly view = this.icon('view')
	static readonly open_folder = this.icon('open_folder')
	static readonly filter_all = this.icon('filter_all')
	static readonly filter_file = this.icon('filter_file')
	static readonly filter_tree = this.icon('filter_tree')
	static readonly filter_tree_highligh = this.icon('filter_tree_highligh')
	static readonly remove_watcher = this.icon('remove_watcher')
	static readonly remove_all = this.icon('remove_all')
	static readonly import_json = this.icon('import_json')
	static readonly export_json = this.icon('export_json')
	static readonly refresh = this.icon('refresh')
}
