import path from 'path';

import routineDump from './lib/routineDump';
import tableDump from './lib/tableDump';
import loadRoutine from './lib/loadRoutine';
import loadTable from './lib/loadTable';
import { ConnectionObject } from './lib/helper';

type SQLSmartDump = {
  saveAllRoutines?: Function;
  saveAllTables?: Function; 
  saveAllTablesWithData?: Function;
  loadAllRoutines?: Function;
  loadAllTables?: Function;
}

export default function (connectionOptions: ConnectionObject, sqlFilesPath: string = path.join(__dirname, '../../../sql')) {
  if (!connectionOptions.connectionLimit) connectionOptions.connectionLimit = 1;

  const sqlSmartDump: SQLSmartDump = {
    ...routineDump(sqlFilesPath, connectionOptions),
    ...tableDump(sqlFilesPath, connectionOptions),
    ...loadRoutine(sqlFilesPath, connectionOptions),
    ...loadTable(sqlFilesPath, connectionOptions),
  }

  return sqlSmartDump;
}
