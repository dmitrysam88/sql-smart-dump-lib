import mysql, { Pool } from 'mysql2/promise';
import { ConnectionObject } from './helper';

export default abstract class RootDumper {

  protected db: Pool;
  protected sqlFilesPath: string;
  protected connectionOptions: ConnectionObject;

  constructor(sqlFilesPath: string, connectionOptions: ConnectionObject) {
    this.connectionOptions = connectionOptions;
    this.sqlFilesPath = sqlFilesPath;
  }

  protected async initDBConnection () {
    this.db = await mysql.createPool(this.connectionOptions);
  }

  protected async closeDBConnection () {
    this.db.end();
  }
}