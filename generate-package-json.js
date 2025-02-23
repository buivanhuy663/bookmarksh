const fs = require('fs');
const path = require('path');

const Commands_1 = require("./out/util/constants/Commands");
const Colors_1 = require("./out/util/constants/Colors");
const basePackageJsonFile = require("./out/util/constants/BasePackage");

const customPackageJsonPath = path.join(__dirname, 'package.json');

const commants = Commands_1.Commands
const colors = Colors_1.Colors

console.log("nameExtension = " + commants.nameExtension)

const basePackageJson = basePackageJsonFile.basePackage;

const customPackageJson = {
  ...basePackageJson,
  contributes: {
    ...basePackageJson.contributes,
    viewsContainers: {
      activitybar: [
        {
          "id": commants.nameExtension,
          "title": "Bookmarks",
          "icon": "resources/bookmark_logo.svg",
        },
        // {
        //   "id": commants.nameExtensionTodo,
        //   "title": "Todos",
        //   "icon": "resources/bookmark_logo.svg",
        // }
      ]
    },
    views: {
      bookmarksh: commants.bookmarksh,
      // todosh: commants.todosh,
    },
    commands: [
      ...Object.values(commants.bookmarkCommands).map((e) => {
        return { "command": e.command, "title": e.title, "icon": e.icon }
      }),
      // ...Object.values(commants.todoCommands).map((e) => {
      //   return { "command": e.command, "title": e.title, "icon": e.icon }
      // }),
    ],
    keybindings: commants.keybindings,
    menus: {
      "commandPalett": commants.commandPalett,
      "view/title": commants.view_title,
      "view/item/context": commants.view_item_context,
      "editor/context": commants.editor_context,
      "bookmarksh.editor.context": commants.submenu_bookmarksh_editor_context,
      "bookmarksh.todo.changeState.submenu": commants.submenu_bookmarksh_todo_changeState,
    },

    submenus: commants.submenus,
    configuration: commants.configuration,
    colors: colors.colors
  }
};

customPackageJson.name = "bookmarksh";
customPackageJson.displayName = "Bookmarks Tree";
customPackageJson.version = "0.1.6";

fs.writeFileSync(customPackageJsonPath, JSON.stringify(customPackageJson, null, 2));

console.log(`Generated custom package.json `);
