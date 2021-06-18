import path from 'path';

import mysql, { Pool } from 'mysql2/promise';

import routineDump from './lib/routineDump';
import tableDump from './lib/tableDump';
import { ConnectionObject } from './lib/helper';

export default function (sqlFilesPath: string, connectionOptions: ConnectionObject) {
  return {
    ...routineDump(sqlFilesPath, connectionOptions),
    ...tableDump(sqlFilesPath, connectionOptions),
  }
}

// (async function () {
//   const sqlDirPath = path.join(__dirname, '..', 'sql');

//   const { saveAllRoutines, saveAllTables, saveAllTablesWithData } = main(sqlDirPath, {
//     host: '192.168.201.221',
//     user: 'root',
//     password: '00!rtvc!00',
//     connectionLimit: 4
//   });

//   await saveAllRoutines();
//   await saveAllTables();
// })();
