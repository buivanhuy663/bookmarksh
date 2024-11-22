const Commands_1 = require("./out/util/Commands");

const fs = require('fs');
const path = require('path');
const { title } = require("process");

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
    viewsContainers: {
      activitybar: [
        {
          "id": id.nameExtension,
          "title": "Bookmarks",
          "icon": "resources/bookmark_logo.svg",
        }
      ]
    },
    commands: Object.values(id.commands).map((e) => { 
      return { "command": e.command, "title": e.title, "icon": e.icon} 
    }),
    keybindings: [
      id.commands.toggleBookmark,
      id.commands.forceAddBookmark,
      id.commands.forceDeleteBookmark,
    ],
    menus: {
      commandPalett: id.commandPalett,
      "view/title": id.view_title,
      "view/item/context": id.view_item_context,
      "editor/context": [
        {
          submenu: Commands_1.Commands.editorContext,
          group: "bookmarksh"
        }
      ],
      "bookmarksh.editor.context": [
        {
          command: id.commands.toggleBookmark.command,
          group: "bookmarksh@1",
          when: "editorTextFocus"
        },
        {
          command: id.commands.forceAddBookmark.command,
          group: "bookmarksh@2",
          when: "editorTextFocus"
        },
        {
          command: id.commands.forceDeleteBookmark.command,
          group: "bookmarksh@3",
          when: "editorTextFocus"
        },
      ],
      "bookmarksh.todo.changeState.submenu": id.bookmarksh_todo_changeState_submenu,
    },

    submenus: [
      {
        "id": Commands_1.Commands.editorContext,
        "label": "Bookmarks Tree"
      },
      {
        "id": 'bookmarksh.todo.changeState.submenu',
        "label": "Change state="
      },
    ],
    views: {
      bookmarksh: id.bookmarksh
    },
    configuration: id.configuration,
    colors: id.allColor
  }
};

customPackageJson.name = "bookmarksh";
customPackageJson.displayName = "Bookmarks Tree";
customPackageJson.version = "0.1.5";

fs.writeFileSync(customPackageJsonPath, JSON.stringify(customPackageJson, null, 2));

console.log(`Generated custom package.json `);
