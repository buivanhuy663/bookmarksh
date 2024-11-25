export const basePackage = {
	"name": "bookmarksh",
	"displayName": "Bookmark Tree",
	"description": "Drag and Drop bookmark, group bookmark, watcher bookmark",
	"version": "0.0.7",
	"publisher": "huybui663",
	"private": true,
	"license": "MIT",
	"icon": "resources/logo/bookmark-logo.png",
	"repository": {
	  "type": "git",
	  "url": "https://github.com/buivanhuy663/Bookmarksh.git"
	},
	"engines": {
	  "vscode": "^1.74.0"
	},
	"categories": [
	  "Other"
	],
	"activationEvents": [
	  "onStartupFinished"
	],
	"main": "./out/extension.js",
	"scripts": {
	  "generate-package-json": "node generate-package-json.js",
	  "build:dev": "cross-env BUILD_ENV=Dev npm run generate-package-json",
	  "build:prod": "cross-env npm run generate-package-json",
	  "vscode:prepublish": "npm run compile",
	  "compile": "tsc -p ./",
	  "watch": "tsc -watch -p ./",
	  "lint": "eslint \"src/**/*.ts\""
	},
	"devDependencies": {
	  "@types/node": "^18",
	  "@types/rimraf": "^2.0.2",
	  "@types/vscode": "^1.73.0",
	  "@typescript-eslint/eslint-plugin": "^7.14.0",
	  "@typescript-eslint/parser": "^7.14.0",
	  "eslint": "^8.26.0",
	  "typescript": "^5.5.2",
	  "cross-env": "^7.0.3"
	},
	"dependencies": {}
  }
  