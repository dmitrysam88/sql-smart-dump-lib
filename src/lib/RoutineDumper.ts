import { saveToFile, ConnectionObject, insertIntoText } from './helper';
import RootDumper from './RootDumper';

type Routine = {
  db: string;
  name: string;
  type: string;
}

const createTemplate: object = {
  FUNCTION: /^CREATE .* FUNCTION /,
  PROCEDURE: /^CREATE .* PROCEDURE /,
};

export class RoutineDumper extends RootDumper {

  constructor (sqlFilesPath: string, connectionOptions: ConnectionObject) {
    super(sqlFilesPath, connectionOptions);
  }

  private async getRoutine(routineType: string): Promise<Routine[]> {
    let routineList: Array<Routine>;

    const res = await this.db.query(`SHOW ${routineType.toUpperCase()} STATUS;`);

    if (Array.isArray(res[0])) {
      routineList = res[0].map((el) => ({ db: el.Db, name: el.Name, type: el.Type }));
    }

    return routineList;
  }

  private async getAllRoutine(): Promise<Routine[]> {
    const res: Array<Array<Routine>> = await Promise.all([this.getRoutine('PROCEDURE'), this.getRoutine('FUNCTION')]);

    return res.reduce((acc, el) => acc.concat(el), []);
  }

  public async saveAllRoutines() {
    await this.initDBConnection();

    let routines: Array<Routine> = await this.getAllRoutine();

    await Promise.allSettled(routines.map(async (routine: Routine): Promise<boolean> => {
      const res = await this.db.query(`SHOW CREATE ${routine.type} ${routine.db}.${routine.name};`);

      if (res[0] && res[0][0] && (res[0][0]['Create Function'] || res[0][0]['Create Procedure'])) {
        let createText: string = res[0][0]['Create Function'] ? res[0][0]['Create Function'] : res[0][0]['Create Procedure'];
        createText = insertIntoText(createText, createTemplate[routine.type.toUpperCase()], `\`${routine.db}\`.`);
        await saveToFile(this.sqlFilesPath, `${routine.db}/${routine.type}`, `${routine.name}.sql`, createText);
        console.log(`Save ${routine.type} ${routine.db}.${routine.name}`);
      }

      return true;
    }));

    await this.closeDBConnection();
  }

}
