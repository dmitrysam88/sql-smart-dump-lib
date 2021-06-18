"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const routineDump_1 = __importDefault(require("./lib/routineDump"));
const tableDump_1 = __importDefault(require("./lib/tableDump"));
function default_1(sqlFilesPath, connectionOptions) {
    return {
        ...routineDump_1.default(sqlFilesPath, connectionOptions),
        ...tableDump_1.default(sqlFilesPath, connectionOptions),
    };
}
exports.default = default_1;
// (async function () {
//   const sqlDirPath = path.join(__dirname, '..', 'sql');
//   const { saveAllRoutines, saveAllTables, saveAllTablesWithData } = main(sqlDirPath, {
//     host: '192.168.201.221',
//     user: 'root',
//     password: '00!rtvc!00',
//     connectionLimit: 4
//   });
//   await saveAllRoutines();
//   await saveAllTables();
// })();
//# sourceMappingURL=index.js.map