import { Pool } from 'mysql2/promise';

import { getDatabaseList, saveToFile, generateInsertCode, ConnectionObject, getPoolConnection, insertIntoText } from './helper';

type DBTable = {
  db: string;
  name: string;
}

const createTemplate: string = 'CREATE TABLE ';

export default function tableDump(sqlFilesPath: string, connectionOptions: ConnectionObject) {

  let db: Pool;

  async function getTable(dbName: string) {
    let tables: Array<DBTable>;

    const res = await db.query(`SHOW TABLE STATUS FROM ${dbName};`);

    if (Array.isArray(res[0])) {
      tables = res[0].map((el) => ({ db: dbName, name: el.Name }));
    }

    return tables;
  }

  async function getAllTables(dataBases: Array<string>): Promise<Array<DBTable>> {
    const tableResp: Array<Array<DBTable>> = await Promise.all(dataBases.map(async (dbName: string) => {
      return getTable(dbName);
    }));

    return tableResp.flat();
  }

  async function saveTablesData(tables: Array<DBTable>) {
    await Promise.allSettled(tables.map(async (table: DBTable) => {
      const res = await db.query(`SELECT * FROM ${table.db}.${table.name};`);

      if (res[0] && res[1]) {
        await saveToFile(sqlFilesPath, `${table.db}/TABLE_DATA`, `${table.name}.sql`, generateInsertCode(res, `${table.db}.${table.name}`));
        console.log(`Save TABLE DATA ${table.db}.${table.name}`);
      }
      return true;
    }));
  }

  async function saveTablesCreate(tables: Array<DBTable>) {
    await Promise.allSettled(tables.map(async (table: DBTable) => {
      const res = await db.query(`SHOW CREATE TABLE ${table.db}.${table.name};`);

      if (res[0] && res[0][0] && (res[0][0]['Create Table'])) {
        const createText: string = insertIntoText(res[0][0]['Create Table'], createTemplate, `\`${table.db}\`.`);
        await saveToFile(sqlFilesPath, `${table.db}/TABLE`, `${table.name}.sql`, createText);
        console.log(`Save TABLE ${table.db}.${table.name}`);
      }

      return true;
    }));
  }

  async function saveAllTables() {
    db = await getPoolConnection(connectionOptions);

    const dataBases: Array<string> = await getDatabaseList(db);
    const tables: Array<DBTable> = await getAllTables(dataBases);

    await saveTablesCreate(tables);

    db.end();
  }

  async function saveAllTablesWithData() {
    db = await getPoolConnection(connectionOptions);

    const dataBases: Array<string> = await getDatabaseList(db);
    const tables: Array<DBTable> = await getAllTables(dataBases);

    await saveTablesCreate(tables);
    await saveTablesData(tables);

    db.end();
  }

  return { saveAllTables, saveAllTablesWithData }
}
