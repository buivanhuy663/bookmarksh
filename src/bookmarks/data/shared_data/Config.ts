export enum StorageMode {
	JSON = 'json',
	WORKSPACE = 'workspace'
}

export class Config {
	static storageMode: StorageMode = StorageMode.WORKSPACE
}
