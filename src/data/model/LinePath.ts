import path = require('path')


export class LinePath {
	public path: string
	public line: number
	public ids = Array<string>()
	constructor(path: string, line: number, id?: string) {
		this.path = path
		this.line = line
		if (id) {
			this.ids.push(id)
		}
	}
}
