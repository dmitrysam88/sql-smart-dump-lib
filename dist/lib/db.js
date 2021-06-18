"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.init = exports.getDB = void 0;
const promise_1 = __importDefault(require("mysql2/promise"));
let db;
function getDB() {
    return db;
}
exports.getDB = getDB;
async function init(connectionOptions) {
    db = await promise_1.default.createPool(connectionOptions);
}
exports.init = init;
//# sourceMappingURL=db.js.map