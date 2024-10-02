const Commands_1 = require("./out/util/Commands");

const fs = require('fs');
const path = require('path');

const env = process.env.BUILD_ENV || '';

const basePackageJsonPath = path.join(__dirname, 'package.base.json');
const customPackageJsonPath = path.join(__dirname, 'package.json');

const id = Commands_1.Commands

console.log("nameExtension = " + id.nameExtension)

const basePackageJson = require(basePackageJsonPath);

const customPackageJson = {
  ...basePackageJson,
  contributes: {
    ...basePackageJson.contributes,
    "viewsContainers": {
      "activitybar": [
        {
          "id": id.nameExtension,
          "title": "Bookmarks",
          "icon": "resources/bookmark_logo.svg",
        }
      ]
    },
    "views": {},
    "commands": Object.values(id.commands),
    "keybindings": [
      id.commands.toggleBookmark,
      id.commands.forkAddBookmark,
      id.commands.forkDeleteBookmark,
    ],
    "menus": {
      "commandPalette": [
        {
          "command": id.commands.toggleBookmark.command,
        },
        {
          "command": id.commands.forkAddBookmark.command,
        },
        {
          "command": id.commands.forkDeleteBookmark.command,
        },
        {
          "command": id.commands.removeAllBookmark.command,
        },
        {
          "command": id.commands.exportAllBookmark.command,
        },
        {
          "command": id.commands.importBookmark.command,
        },
        {
          "command": id.commands.filterAll.command,
        },
        {
          "command": id.commands.filterFile.command,
        },
        {
          "command": id.commands.filterTree.command,
        },
        {
          "command": id.commands.refresh.command,
        },
        {
          "command": id.commands.removeAllWatcher.command,
        },
      ],
      "view/title": [
        id.commands.removeAllBookmark,
        id.commands.exportAllBookmark,
        id.commands.importBookmark,
        id.commands.filterAll,
        id.commands.filterFile,
        id.commands.filterTree,
        id.commands.refresh,
        id.commands.removeAllWatcher,
      ],
      "view/item/context": [
        id.commands.pinView,
        id.commands.editBookmark,
        id.commands.deleteBookmark,
        id.commands.exportBookmark,
        id.commands.addToWatcher,
        id.commands.removeWatcher,
      ],
      "editor/context": [
        {
          "submenu": Commands_1.Commands.editorContext,
          "group": "bookmarksh"
        }
      ],
      "bookmarksh.editor.context": [
        {
          "command": id.commands.toggleBookmark.command,
          "group": "bookmarksh@1",
          "when": "editorTextFocus"
        },
        {
          "command": id.commands.forkAddBookmark.command,
          "group": "bookmarksh@2",
          "when": "editorTextFocus"
        },
        {
          "command": id.commands.forkDeleteBookmark.command,
          "group": "bookmarksh@3",
          "when": "editorTextFocus"
        },
      ],
    },
    "submenus": [
      {
        "id": Commands_1.Commands.editorContext,
        "label": "Bookmarks Tree"
      }
    ],
    "views": {
      "bookmarksh": id.bookmarksh
    }
  }
};

customPackageJson.name = "bookmarksh";
customPackageJson.displayName = "Bookmarks Tree";
customPackageJson.version = "0.0.18";

fs.writeFileSync(customPackageJsonPath, JSON.stringify(customPackageJson, null, 2));

console.log(`Generated custom package.json `);


