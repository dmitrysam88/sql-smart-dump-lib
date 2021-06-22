## SQL smart dump library

This library can help you to du and load you MySQL database dump or write data to your database.

Example:

```js
const sqlSmartDump = require('sql-smart-dump-lib').default;

const { saveAllRoutines, saveAllTables, saveAllTablesWithData, loadAllRoutines, loadAllTables } = sqlSmartDump({
    host: 'localhost',
    user: 'root',
    password: '123456',
    connectionLimit: 4
  }, path.join(__dirname, 'sql'),);

  await saveAllRoutines();
  await saveAllTables();
```
There are few functions in the library:

- `saveAllRoutines` - save routines (functions and procedures) from database into files;
- `saveAllTables` - save tables creating code from data base into files;
- `saveAllTablesWithData` - save tables and datas from data base into files (please don't use with `saveAllTables`, choose only one of them);
- `loadAllRoutines` - upload routines (functions and procedures) from files to database;
- `loadAllTables` - upload tables creating code from files to database;


