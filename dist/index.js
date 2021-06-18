"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const promise_1 = __importDefault(require("mysql2/promise"));
const routineDump_1 = __importDefault(require("./lib/routineDump"));
const tableDump_1 = __importDefault(require("./lib/tableDump"));
async function default_1(sqlFilesPath, connectionOptions) {
    if (!connectionOptions?.connectionLimit) {
        connectionOptions.connectionLimit = 1;
    }
    const dbConnection = await promise_1.default.createPool(connectionOptions);
    return {
        ...routineDump_1.default(sqlFilesPath, dbConnection),
        ...tableDump_1.default(sqlFilesPath, dbConnection),
    };
}
exports.default = default_1;
// (async function () {
//   const sqlDirPath = path.join(__dirname, '..', 'sql');
//   const { saveAllRoutines, saveAllTables, saveAllTablesWithData } = await main(sqlDirPath, {
//     host: '192.168.201.221',
//     user: 'root',
//     password: '00!rtvc!00',
//     connectionLimit: 4
//   });
//   await saveAllRoutines();
//   await saveAllTables();
//   process.exit(0);
//   // await saveAllTablesWithData();
// })();
//# sourceMappingURL=index.js.map