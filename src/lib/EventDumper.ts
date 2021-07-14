import { Pool } from 'mysql2/promise';

import { ConnectionObject, getDatabaseList, insertIntoText, saveToFile } from './helper';
import RootDumper from './RootDumper';

type Event = {
  db: string;
  name: string;
}

const createTemplate: RegExp = /^CREATE .* EVENT /;

export class EventDumper extends RootDumper {

  constructor(sqlFilesPath: string, connectionOptions: ConnectionObject) {
    super(sqlFilesPath, connectionOptions);
  }

  private async getEvent(dbName: string) {
    let events: Array<Event>;

    const res = await this.db.query(`SHOW EVENTS FROM ${dbName};`);

    if (Array.isArray(res[0])) {
      events = res[0].map((el) => ({ db: dbName, name: el.Name }));
    }

    return events;
  }

  private async getAllEvents(dataBases: Array<string>): Promise<Array<Event>> {
    const tableResp: Array<Array<Event>> = await Promise.all(dataBases.map(async (dbName: string) => {
      return this.getEvent(dbName);
    }));

    return tableResp.flat();
  }

  public async saveAllEvents(dbName: string = 'all') {
    await this.initDBConnection();

    const dataBases: Array<string> = await getDatabaseList(this.db, dbName);
    const events: Array<Event> = await this.getAllEvents(dataBases);

    await Promise.allSettled(events.map(async (event: Event) => {
      const res = await this.db.query(`SHOW CREATE EVENT ${event.db}.${event.name};`);

      if (res[0] && res[0][0] && (res[0][0]['Create Event'])) {
        const createText: string = insertIntoText(res[0][0]['Create Event'], createTemplate, `\`${event.db}\`.`);
        await saveToFile(this.sqlFilesPath, `${event.db}/EVENT`, `${event.name}.sql`, createText);
        console.log(`Save EVENT ${event.db}.${event.name}`);
      }

      return true;
    }));

    await this.closeDBConnection();
  }

}
