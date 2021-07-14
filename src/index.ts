// export { RoutineDumper } from './lib/RoutineDumper';
// export { TableDumper } from './lib/TableDumper';
// export { EventDumper } from './lib/EventDumper';
// export { ElementLoader } from './lib/ElementLoader';

import { RoutineDumper } from './lib/RoutineDumper';
import { TableDumper } from './lib/TableDumper';
import { EventDumper } from './lib/EventDumper';
import { ElementLoader } from './lib/ElementLoader';

const sqlPath = `${__dirname}/../sql`;

const dbConnestionOptions = {
  host: '192.168.201.221',
  user: 'root',
  password: '00!rtvc!00',
  connectionLimit: 4,
};

(async function () {
  const eventDump = new EventDumper(sqlPath, dbConnestionOptions);
  const routineDump = new RoutineDumper(sqlPath, dbConnestionOptions);
  const tableDump = new TableDumper(sqlPath, dbConnestionOptions);

  await eventDump.saveAllEvents();
  await tableDump.saveAllTables();
  await routineDump.saveAllRoutines();
})();
