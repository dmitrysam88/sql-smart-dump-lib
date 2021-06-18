"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const routineDump_1 = __importDefault(require("./lib/routineDump"));
const tableDump_1 = __importDefault(require("./lib/tableDump"));
function default_1(connectionOptions, sqlFilesPath = path_1.default.join(__dirname, '../../sql')) {
    if (!connectionOptions.connectionLimit)
        connectionOptions.connectionLimit = 1;
    return {
        ...routineDump_1.default(sqlFilesPath, connectionOptions),
        ...tableDump_1.default(sqlFilesPath, connectionOptions),
    };
}
exports.default = default_1;
//# sourceMappingURL=index.js.map