"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDatabaseList = void 0;
const db_1 = require("./db");
function getDatabaseList() {
    return __awaiter(this, void 0, void 0, function* () {
        const db = db_1.getDB();
        let dbList;
        const res = yield db.query('SHOW DATABASES;');
        if (Array.isArray(res[0])) {
            dbList = res[0].map((el) => el.Database);
        }
        return dbList;
    });
}
exports.getDatabaseList = getDatabaseList;
//# sourceMappingURL=helper-request.js.map