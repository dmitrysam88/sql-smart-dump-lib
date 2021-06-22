import { Pool } from 'mysql2/promise';

import { ConnectionObject, getPoolConnection, getDirFiles, readFromFile, getDirs, createDBs } from './helper';

export default function loadRoutines(sqlFilesPath: string, connectionOptions: ConnectionObject) {

  let db: Pool;

  async function createRoutine(filePath: string): Promise<boolean> {
    try {
      const queryText = await readFromFile(filePath);
      await db.query(queryText);
      console.log(`Create routine ${filePath}`);
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  async function loadAllRoutines() {
    db = await getPoolConnection(connectionOptions);

    const dbList: Array<string> = await getDirs(sqlFilesPath);

    await Promise.allSettled(dbList.map((dbName: string) => createDBs(db, dbName)));

    const routineFiles: Array<string> = await getDirFiles(sqlFilesPath, ['TABLE', 'TABLE_DATA']);

    await Promise.allSettled(routineFiles.map((file: string): Promise<boolean> => (createRoutine(file))));

    db.end();
  }

  return { loadAllRoutines };

}
