import moment from 'moment';

import { getDatabaseList, saveToFile, ConnectionObject, insertIntoText } from './helper';
import RootDumper from './RootDumper';

type DBTable = {
  db: string;
  name: string;
}

const createTemplate: string = 'CREATE TABLE ';

export class TableDumper extends RootDumper {

  constructor(sqlFilesPath: string, connectionOptions: ConnectionObject) {
    super(sqlFilesPath, connectionOptions);
  }

  private getObjectValue(obj: object, field: string) {
    let value: string | number | null | boolean;

    if (typeof obj[field] === 'string') {
      value = `'${obj[field]}'`;
    } else if (typeof obj[field] === 'object' && obj[field] instanceof Date) {
      value = `'${moment(obj[field]).format('YYYY-MM-DD hh:mm:ss')}'`;
    } else if (typeof obj[field] === 'object') {
      value = `'${JSON.stringify(obj[field])}'`;
    } else {
      value = obj[field]
    }

    return value;
  }

  private generateInsertCode(queryResult: Array<any>, fullTableName: string): string {
    if (queryResult.length < 2) return '';
    const fields: Array<string> = queryResult[1].map((field) => field.name);
    const data: Array<object> = queryResult[0];
    const strData: Array<string> = data.map((el: object) => `(${fields.map((field: string) => this.getObjectValue(el, field)).join()})`);

    let result: string = `INSERT INTO ${fullTableName} (${fields.join()}) VALUES \n${strData.join(',\n')};`;
    return result;
  }

  private async getTable(dbName: string) {
    let tables: Array<DBTable>;

    const res = await this.db.query(`SHOW TABLE STATUS FROM ${dbName};`);

    if (Array.isArray(res[0])) {
      tables = res[0].map((el) => ({ db: dbName, name: el.Name }));
    }

    return tables;
  }

  private async getAllTables(dataBases: Array<string>): Promise<Array<DBTable>> {
    const tableResp: Array<Array<DBTable>> = await Promise.all(dataBases.map(async (dbName: string) => {
      return this.getTable(dbName);
    }));

    return tableResp.flat();
  }

  private async saveTablesData(tables: Array<DBTable>) {
    await Promise.allSettled(tables.map(async (table: DBTable) => {
      const res = await this.db.query(`SELECT * FROM ${table.db}.${table.name};`);

      if (res[0] && res[1]) {
        await saveToFile(this.sqlFilesPath, `${table.db}/TABLE_DATA`, `${table.name}.sql`, this.generateInsertCode(res, `${table.db}.${table.name}`));
        console.log(`Save TABLE DATA ${table.db}.${table.name}`);
      }
      return true;
    }));
  }

  private async saveTablesCreate(tables: Array<DBTable>) {
    await Promise.allSettled(tables.map(async (table: DBTable) => {
      const res = await this.db.query(`SHOW CREATE TABLE ${table.db}.${table.name};`);

      if (res[0] && res[0][0] && (res[0][0]['Create Table'])) {
        const createText: string = insertIntoText(res[0][0]['Create Table'], createTemplate, `\`${table.db}\`.`);
        await saveToFile(this.sqlFilesPath, `${table.db}/TABLE`, `${table.name}.sql`, createText);
        console.log(`Save TABLE ${table.db}.${table.name}`);
      }

      return true;
    }));
  }

  public async saveAllTables(dbName: string = 'all') {
    await this.initDBConnection();

    const dataBases: Array<string> = await getDatabaseList(this.db, dbName);
    const tables: Array<DBTable> = await this.getAllTables(dataBases);

    await this.saveTablesCreate(tables);

    await this.closeDBConnection();
  }

  public async saveAllTablesWithData(dbName: string = 'all') {
    await this.initDBConnection();

    const dataBases: Array<string> = await getDatabaseList(this.db, dbName);
    const tables: Array<DBTable> = await this.getAllTables(dataBases);

    await this.saveTablesCreate(tables);
    await this.saveTablesData(tables);

    await this.closeDBConnection();
  }

}
