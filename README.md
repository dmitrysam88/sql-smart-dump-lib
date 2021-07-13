## SQL smart dump library

This library can help you to du and load you MySQL database dump or write data to your database.

Example:

```js
const path = require('path');

const { EventDumper, RoutineDumper, TableDumper } = require('sql-smart-dump-lib');

const sqlPath = path.join(__dirname, 'sql');

const dbConnectOPtions = {
  host: 'localhost',
  user: 'root',
  password: '123456',
  connectionLimit: 4
};

const eventDump = new EventDumper(sqlPath, dbConnestionOptions);
const routineDump = new RoutineDumper(sqlPath, dbConnestionOptions);
const tableDump = new TableDumper(sqlPath, dbConnestionOptions);

await eventDump.saveAllEvents();
await routineDump.saveAllRoutines();
await tableDump.saveAllTables();
```

Load from files to database:

```js

const path = require('path');

const { ElementLoader } = require('sql-smart-dump-lib');

const sqlPath = path.join(__dirname, 'sql');

const dbConnectOPtions = {
  host: 'localhost',
  user: 'root',
  password: '123456',
  connectionLimit: 4
};

const elementLoad = new ElementLoader(sqlPath, dbConnestionOptions);

await elementLoad.loadAllEvents();
await elementLoad.loadAllRoutines();
await elementLoad.loadAllTables();

```

There are few classes with methods in the library:

- `RoutineDumper.saveAllRoutines` - save routines (functions and procedures) from database into files;
- `TableDumper.saveAllTables` - save tables creating code from data base into files;
- `TableDumper.saveAllTablesWithData` - save tables and datas from data base into files (please don't use with `saveAllTables`, choose only one of them);
- `EventDumper.saveAllEvents` - save events from database into files;
- `ElementLoader.loadAllRoutines` - upload routines (functions and procedures) from files to database;
- `ElementLoader.loadAllTables` - upload tables creating code from files to database;
- `ElementLoader.loadAllEvents` - upload events from files to database;


