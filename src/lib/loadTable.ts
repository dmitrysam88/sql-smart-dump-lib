import { Pool } from 'mysql2/promise';

import { ConnectionObject, getPoolConnection, getDirFiles, readFromFile, getDirs, createDBs } from './helper';

export default function loadRoutines(sqlFilesPath: string, connectionOptions: ConnectionObject) {
  
  let db: Pool;

  async function createTable(filePath: string): Promise<boolean> {
    try {
      const queryText = await readFromFile(filePath);
      await db.query(queryText);
      console.log(`Create table ${filePath}`);
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  async function loadAllTables() {
    db = await getPoolConnection(connectionOptions);

    const dbList: Array<string> = await getDirs(sqlFilesPath);

    await Promise.allSettled(dbList.map((dbName: string) => createDBs(db, dbName)));

    const tableFiles: Array<string> = await getDirFiles(sqlFilesPath, ['PROCEDURE', 'FUNCTION', 'TABLE_DATA']);

    await Promise.allSettled(tableFiles.map((file: string): Promise<boolean> => (createTable(file))));

    db.end();
  }

  return { loadAllTables }
}
