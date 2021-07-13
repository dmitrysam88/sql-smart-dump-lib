import { Pool } from 'mysql2/promise';

import { ConnectionObject, getDirFiles, getDirs, getPoolConnection, readFromFile } from './helper';

export class ElementLoader {

  protected db: Pool;
  protected sqlFilesPath: string;
  protected connectionOptions: ConnectionObject;
  
  constructor(sqlFilesPath: string, connectionOptions: ConnectionObject) {
    this.connectionOptions = connectionOptions;
    this.sqlFilesPath = sqlFilesPath;
  }

  private async createDBs(db: Pool, dbName: string): Promise<boolean> {
    await this.db.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);
    console.log(`Create database ${dbName}`);
    return true;
  }

  private async createElement(elementType: string, filePath: string): Promise<boolean> {
    try {
      const queryText = await readFromFile(filePath);
      await this.db.query(queryText);
      console.log(`Create ${elementType} ${filePath}`);
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  private async loadAllElements(dirFilter: Array<string>, elementType: string) {
    this.db = await getPoolConnection(this.connectionOptions);

    const dbList: Array<string> = await getDirs(this.sqlFilesPath);

    await Promise.allSettled(dbList.map((dbName: string) => this.createDBs(this.db, dbName)));

    const elementFiles: Array<string> = await getDirFiles(this.sqlFilesPath, dirFilter);

    await Promise.allSettled(elementFiles.map((file: string): Promise<boolean> => (this.createElement(elementType, file))));

    this.db.end();
  }

  public async loadAllEvents() {
    await this.loadAllElements(['TABLE', 'TABLE_DATA', 'PROCEDURE', 'FUNCTION'], 'event');
  }

  public async loadAllRoutines() {
    await this.loadAllElements(['TABLE', 'TABLE_DATA', 'EVENT'], 'routine');
  }

  public async loadAllTables() {
    await this.loadAllElements(['PROCEDURE', 'FUNCTION', 'TABLE_DATA', 'EVENT'], 'table');
  }

}
