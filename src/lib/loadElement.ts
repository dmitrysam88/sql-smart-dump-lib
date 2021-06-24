import { Pool } from 'mysql2/promise';

import { ConnectionObject, getDirFiles, getDirs, getPoolConnection, readFromFile } from './helper';

export default function loadElement(sqlFilesPath: string, connectionOptions: ConnectionObject) {

    let db: Pool;

    async function createDBs(db: Pool, dbName: string): Promise<boolean> {
      await db.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);
      console.log(`Create database ${dbName}`);
      return true;
    }
  
    async function createElement(elementType: string, filePath: string): Promise<boolean> {
      try {
        const queryText = await readFromFile(filePath);
        await db.query(queryText);
        console.log(`Create ${elementType} ${filePath}`);
        return true;
      } catch (error) {
        console.error(error);
        return false;
      }
    }

    async function loadAllElements(dirFilter: Array<string>, elementType: string) {
      db = await getPoolConnection(connectionOptions);
  
      const dbList: Array<string> = await getDirs(sqlFilesPath);
  
      await Promise.allSettled(dbList.map((dbName: string) => createDBs(db, dbName)));
  
      const elementFiles: Array<string> = await getDirFiles(sqlFilesPath, dirFilter);
  
      await Promise.allSettled(elementFiles.map((file: string): Promise<boolean> => (createElement(elementType, file))));
  
      db.end();
    }
  
    async function loadAllEvents() {
      await loadAllElements(['TABLE', 'TABLE_DATA', 'PROCEDURE', 'FUNCTION'], 'event');
    }

    async function loadAllRoutines() {
      await loadAllElements(['TABLE', 'TABLE_DATA', 'EVENT'], 'routine');
    }

    async function loadAllTables() {
      await loadAllElements(['PROCEDURE', 'FUNCTION', 'TABLE_DATA', 'EVENT'], 'table');
    }
  
    return { loadAllEvents, loadAllRoutines, loadAllTables };
  
  }