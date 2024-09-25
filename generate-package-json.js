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
          "title": "Bookmarks Tree",
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
      "view/title": [
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
      ]
    },
    "views": {
      "bookmarksh": id.bookmarksh
    }
  }
};

customPackageJson.name = "bookmarksh";
customPackageJson.displayName = "Bookmarks Tree";
customPackageJson.version = "0.0.10";

fs.writeFileSync(customPackageJsonPath, JSON.stringify(customPackageJson, null, 2));

console.log(`Generated custom package.json `);


