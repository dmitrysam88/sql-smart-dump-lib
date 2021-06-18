import path from 'path';

import routineDump from './lib/routineDump';
import tableDump from './lib/tableDump';
import { ConnectionObject } from './lib/helper';

export default function (connectionOptions: ConnectionObject, sqlFilesPath: string = path.join(__dirname, '../../../sql')) {
  if (!connectionOptions.connectionLimit) connectionOptions.connectionLimit = 1;

  return {
    ...routineDump(sqlFilesPath, connectionOptions),
    ...tableDump(sqlFilesPath, connectionOptions),
  }
}
