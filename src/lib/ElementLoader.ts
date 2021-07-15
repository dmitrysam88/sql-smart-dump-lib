import { Pool } from 'mysql2/promise';

import { ConnectionObject, createDirFilter, getDirFiles, getDirs, getPoolConnection, readFromFile } from './helper';

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

  private async loadAllElements(dirFilter: RegExp, elementType: string) {
    this.db = await getPoolConnection(this.connectionOptions);

    const dbList: Array<string> = await getDirs(this.sqlFilesPath);

    await Promise.allSettled(dbList.map((dbName: string) => this.createDBs(this.db, dbName)));

    const elementFiles: Array<string> = await getDirFiles(this.sqlFilesPath, dirFilter);

    await Promise.allSettled(elementFiles.map((file: string): Promise<boolean> => (this.createElement(elementType, file))));

    this.db.end();
  }

  public async loadAllEvents(dbName: string = undefined) {
    const RegDirFilter = createDirFilter(['EVENT'], dbName);
    
    await this.loadAllElements(RegDirFilter, 'event');
  }

  public async loadAllRoutines(dbName: string = undefined) {
    const RegDirFilter = createDirFilter(['PROCEDURE', 'FUNCTION'], dbName);

    await this.loadAllElements(RegDirFilter, 'routine');
  }

  public async loadAllTables(dbName: string = undefined) {
    const RegDirFilter = createDirFilter(['TABLE'], dbName);
    
    await this.loadAllElements(RegDirFilter, 'table');
  }

}
