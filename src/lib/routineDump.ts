import { Pool } from 'mysql2/promise';

import { saveToFile } from './helper';

type Routine = {
  db: string;
  name: string;
  type: string;
}

export default function routineDump(sqlFilesPath: string, db: Pool) {

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
    let routines: Array<Routine> = await getAllRoutine();

    await Promise.allSettled(routines.map(async (routine: Routine): Promise<boolean> => {
      const res = await db.query(`SHOW CREATE ${routine.type} ${routine.db}.${routine.name};`);

      if (res[0] && res[0][0] && (res[0][0]['Create Function'] || res[0][0]['Create Procedure'])) {
        let createText: string = res[0][0]['Create Function'] ? res[0][0]['Create Function'] : res[0][0]['Create Procedure'];
        await saveToFile(sqlFilesPath, `${routine.db}/${routine.type}`, `${routine.name}.sql`, createText);
        console.log(`Save ${routine.type} ${routine.db}.${routine.name}`);
      }

      return true;
    }));
  }

  return { saveAllRoutines };
}
