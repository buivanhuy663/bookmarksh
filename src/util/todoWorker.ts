import path = require("path");
import { LineParam } from "../bookmark-provider/data/model/todo/TodoNode";
import { todoSupporEx } from "../bookmark-provider/data/model/todo/todoSupporEx";

const { parentPort, workerData } = require('worker_threads');
const fs = require('fs');
const readline = require('readline');
const ConstantsValue = require('./ConstantsValue'); // Điều chỉnh đường dẫn nếu cần


async function getAllTodoInRoot(
	root: string,
	findTodo: (param: LineParam) => void,
) {
	if (root === undefined || root === null || root === '') {
		return
	}
	const items = fs.readdirSync(root);
	for (const item of items) {
		const fullPath = path.join(root, item);
		const stat = fs.statSync(fullPath);

		if (stat.isDirectory()) {
			// Nếu là thư mục, đệ quy vào bên trong
			getAllTodoInRoot(fullPath, findTodo);
		} else {
			// Nếu là file, thêm vào danh sách
			if (todoSupporEx.has(path.extname(fullPath))) {
				getTodoInfile(fullPath, findTodo)
			}
		}
	}
}


async function getTodoInfile(
	filePath: string,
	findTodo: (param: LineParam) => void,
) {

	const fileStream = fs.createReadStream(filePath);
	const rl = readline.createInterface({
		input: fileStream,
		crlfDelay: Infinity,
	});
	let lineNumber = 0;
	for await (const line of rl) {
		const match = line.match(ConstantsValue.todoRegex);
		if (match?.length ?? 0 > 0) {
			parentPort.postMessage({ todo: line, filePath: filePath, lineNum: lineNumber, match: match });
		}
		lineNumber++;
	}
}

getAllTodoInRoot(workerData.filePath, workerData.findTodo);