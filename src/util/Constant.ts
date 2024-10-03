export class KeyBinding {
	static readonly toggleBookmark = 'ctrl+alt+m'
	static readonly forceAddBookmark = 'ctrl+alt+shift+m'
	static readonly forceDeleteBookmark = 'ctrl+alt+shift+d'
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
