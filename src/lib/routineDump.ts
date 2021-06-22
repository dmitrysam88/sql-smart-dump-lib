import { Pool } from 'mysql2/promise';

import { saveToFile, ConnectionObject, getPoolConnection, insertIntoText } from './helper';

type Routine = {
  db: string;
  name: string;
  type: string;
}

const createTemplate: object = {
  FUNCTION: /^CREATE .* FUNCTION /,
  PROCEDURE: /^CREATE .* PROCEDURE /,
};

export default function routineDump(sqlFilesPath: string, connectionOptions: ConnectionObject) {

  let db: Pool;

  async function getRoutine(routineType: string): Promise<Routine[]> {
    let routineList: Array<Routine>;

    const res = await db.query(`SHOW ${routineType.toUpperCase()} STATUS;`);

    if (Array.isArray(res[0])) {
      routineList = res[0].map((el) => ({ db: el.Db, name: el.Name, type: el.Type }));
    }

    return routineList;
  }

  async function getAllRoutine(): Promise<Routine[]> {
    const res: Array<Array<Routine>> = await Promise.all([getRoutine('PROCEDURE'), getRoutine('FUNCTION')]);

    return res.reduce((acc, el) => acc.concat(el), []);
  }

  async function saveAllRoutines() {
    db = await getPoolConnection(connectionOptions);

    let routines: Array<Routine> = await getAllRoutine();

    await Promise.allSettled(routines.map(async (routine: Routine): Promise<boolean> => {
      const res = await db.query(`SHOW CREATE ${routine.type} ${routine.db}.${routine.name};`);

      if (res[0] && res[0][0] && (res[0][0]['Create Function'] || res[0][0]['Create Procedure'])) {
        let createText: string = res[0][0]['Create Function'] ? res[0][0]['Create Function'] : res[0][0]['Create Procedure'];
        createText = insertIntoText(createText, createTemplate[routine.type.toUpperCase()], `\`${routine.db}\`.`);
        await saveToFile(sqlFilesPath, `${routine.db}/${routine.type}`, `${routine.name}.sql`, createText);
        console.log(`Save ${routine.type} ${routine.db}.${routine.name}`);
      }

      return true;
    }));

    db.end();
  }

  return { saveAllRoutines };
}
