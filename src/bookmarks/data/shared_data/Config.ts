export enum StorageMode {
	JSON = 'json',
	WORKSPACE = 'workspace'
}

export class Config {
	static autoBackupJson = false
	static storageMode: StorageMode = StorageMode.WORKSPACE
}
