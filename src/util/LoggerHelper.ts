import * as vscode from 'vscode';

class LoggerHelper {
	private canLog: boolean = false;

	infor(message: any) {
		if (this.canLog)
			console.log(message);
	}

	error(message: any) {
		if (this.canLog)
			console.error(message);
	}

	warning(message: any) {
		if (this.canLog)
			console.warn(message);
	}

	showWarningMessage(message: string) {
		if (this.canLog)
			vscode.window.showWarningMessage(message);
	}
	showMessage(message: string) {
		if (this.canLog)
			vscode.window.showInformationMessage(message);
	}

	showErrorMessage(message: string) {
		if (this.canLog)
			vscode.window.showErrorMessage(message);
	}
}

export const logger = new LoggerHelper();
