import { Color } from "vscode"

export class Colors {
	static readonly prefix = 'bookmarksh.color.'

	static readonly value = {
		red: '#ff0000',
		yellow: '#ffff00',
		green: '#00ff00',
		blue: '#009eff',
	}

	static readonly Red = {
		id: this.prefix + 'Red',
		defaults: { dark: this.value.red, light: this.value.red },
		description: "red",
	}
	static readonly Todo = {
		id: this.prefix + 'Todo',
		defaults: { dark: this.value.green, light: this.value.green },
		description: "green",
	}
	static readonly InProgress = {
		id: this.prefix + 'InProgress',
		defaults: { dark: this.value.yellow, light: this.value.yellow },
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

	static colors = [
		this.Todo,
		this.InProgress,
		this.Hold,
		this.Warning,
		this.Error,
		this.Done,
		this.NeedReview,
		this.NeedRemove,
		this.NeedImprove,

		this.Red,
	]
}
