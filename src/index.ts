import path from 'path';

import routineDump from './lib/routineDump';
import tableDump from './lib/tableDump';
import eventDump from './lib/eventDump';
import loadElement from './lib/loadElement';
import { ConnectionObject } from './lib/helper';

export default function (connectionOptions: ConnectionObject, sqlFilesPath: string = path.join(__dirname, '../../../sql')) {
  if (!connectionOptions.connectionLimit) connectionOptions.connectionLimit = 1;

  return {
    ...routineDump(sqlFilesPath, connectionOptions),
    ...tableDump(sqlFilesPath, connectionOptions),
    ...eventDump(sqlFilesPath, connectionOptions),
    ...loadElement(sqlFilesPath, connectionOptions),
  }
}
