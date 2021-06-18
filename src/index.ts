import path from 'path';

import mysql, { Pool } from 'mysql2/promise';

import routineDump from './lib/routineDump';
import tableDump from './lib/tableDump';

export type ConnectionObject = {
  host: string;
  user: string;
  password: string;
  connectionLimit?: number;
  database?: string;
}

export default async function (sqlFilesPath: string, connectionOptions: ConnectionObject) {
  if (!connectionOptions?.connectionLimit) {
    connectionOptions.connectionLimit = 1;
  }
  const dbConnection: Pool = await mysql.createPool(connectionOptions);

  return {
    ...routineDump(sqlFilesPath, dbConnection),
    ...tableDump(sqlFilesPath, dbConnection),
  }
}

// (async function () {
//   const sqlDirPath = path.join(__dirname, '..', 'sql');

//   const { saveAllRoutines, saveAllTables, saveAllTablesWithData } = await main(sqlDirPath, {
//     host: '192.168.201.221',
//     user: 'root',
//     password: '00!rtvc!00',
//     connectionLimit: 4
//   });

//   await saveAllRoutines();
//   await saveAllTables();

//   process.exit(0);
//   // await saveAllTablesWithData();

// })();
