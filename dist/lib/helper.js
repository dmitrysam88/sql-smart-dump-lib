"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPoolConnection = exports.readFromFile = exports.saveToFile = exports.generateInsertCode = exports.createDirIfNotExist = exports.getDatabaseList = void 0;
const fs_1 = __importDefault(require("fs"));
const util_1 = require("util");
const promise_1 = __importDefault(require("mysql2/promise"));
const moment_1 = __importDefault(require("moment"));
const asyncExist = util_1.promisify(fs_1.default.exists);
const asyncWrite = util_1.promisify(fs_1.default.writeFile);
const asyncMkdir = util_1.promisify(fs_1.default.mkdir);
const asyncRead = util_1.promisify(fs_1.default.readFile);
async function getDatabaseList(db) {
    let dbList;
    const res = await db.query('SHOW DATABASES;');
    if (Array.isArray(res[0])) {
        dbList = res[0].map((el) => el.Database);
    }
    return dbList;
}
exports.getDatabaseList = getDatabaseList;
async function createDirIfNotExist(path) {
    if (!(await asyncExist(path))) {
        await asyncMkdir(path, { recursive: true });
    }
}
exports.createDirIfNotExist = createDirIfNotExist;
function getObjectValue(obj, field) {
    let value;
    if (typeof obj[field] === 'string') {
        value = `'${obj[field]}'`;
    }
    else if (typeof obj[field] === 'object' && obj[field] instanceof Date) {
        value = `'${moment_1.default(obj[field]).format('YYYY-MM-DD hh:mm:ss')}'`;
    }
    else if (typeof obj[field] === 'object') {
        value = `'${JSON.stringify(obj[field])}'`;
    }
    else {
        value = obj[field];
    }
    return value;
}
function generateInsertCode(queryResult, fullTableName) {
    if (queryResult.length < 2)
        return '';
    const fields = queryResult[1].map((field) => field.name);
    const data = queryResult[0];
    const strData = data.map((el) => `(${fields.map((field) => getObjectValue(el, field)).join()})`);
    let result = `INSERT INTO ${fullTableName} (${fields.join()}) VALUES \n${strData.join(',\n')};`;
    return result;
}
exports.generateInsertCode = generateInsertCode;
async function saveToFile(sqlDirPath, filePath, filename, fileContent) {
    const fullFilePath = `${sqlDirPath}/${filePath}`;
    await createDirIfNotExist(fullFilePath);
    await asyncWrite(`${fullFilePath}/${filename}`, fileContent, 'utf8');
}
exports.saveToFile = saveToFile;
async function readFromFile(sqlDirPath, filePath) {
    const fullFilePath = `${sqlDirPath}/${filePath}`;
    if (await asyncExist(fullFilePath)) {
        return asyncRead(fullFilePath, 'utf8');
    }
    return undefined;
}
exports.readFromFile = readFromFile;
;
async function getPoolConnection(connectionOptions) {
    return promise_1.default.createPool(connectionOptions);
}
exports.getPoolConnection = getPoolConnection;
//# sourceMappingURL=helper.js.map