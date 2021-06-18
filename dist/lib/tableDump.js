"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const helper_1 = require("./helper");
function tableDump(sqlFilesPath, connectionOptions) {
    let db;
    async function getTable(dbName) {
        let tables;
        const res = await db.query(`SHOW TABLE STATUS FROM ${dbName};`);
        if (Array.isArray(res[0])) {
            tables = res[0].map((el) => ({ db: dbName, name: el.Name }));
        }
        return tables;
    }
    async function getAllTables(dataBases) {
        const tableResp = await Promise.all(dataBases.map(async (dbName) => {
            return getTable(dbName);
        }));
        return tableResp.flat();
    }
    async function saveTablesData(tables) {
        await Promise.allSettled(tables.map(async (table) => {
            const res = await db.query(`SELECT * FROM ${table.db}.${table.name};`);
            if (res[0] && res[1]) {
                await helper_1.saveToFile(sqlFilesPath, `${table.db}/TABLE_DATA`, `${table.name}.sql`, helper_1.generateInsertCode(res, `${table.db}.${table.name}`));
                console.log(`Save TABLE DATA ${table.db}.${table.name}`);
            }
            return true;
        }));
    }
    async function saveTablesCreate(tables) {
        await Promise.allSettled(tables.map(async (table) => {
            const res = await db.query(`SHOW CREATE TABLE ${table.db}.${table.name};`);
            if (res[0] && res[0][0] && (res[0][0]['Create Table'])) {
                await helper_1.saveToFile(sqlFilesPath, `${table.db}/TABLE`, `${table.name}.sql`, res[0][0]['Create Table']);
                console.log(`Save TABLE ${table.db}.${table.name}`);
            }
            return true;
        }));
    }
    async function saveAllTables() {
        db = await helper_1.getPoolConnection(connectionOptions);
        const dataBases = await helper_1.getDatabaseList(db);
        const tables = await getAllTables(dataBases);
        await saveTablesCreate(tables);
        db.end();
    }
    async function saveAllTablesWithData() {
        db = await helper_1.getPoolConnection(connectionOptions);
        const dataBases = await helper_1.getDatabaseList(db);
        const tables = await getAllTables(dataBases);
        await saveTablesCreate(tables);
        await saveTablesData(tables);
        db.end();
    }
    return { saveAllTables, saveAllTablesWithData };
}
exports.default = tableDump;
//# sourceMappingURL=tableDump.js.map