import { Pool } from 'mysql2/promise';

import { ConnectionObject, getDatabaseList, getPoolConnection, insertIntoText, saveToFile } from './helper';

type Event = {
  db: string;
  name: string;
}

const createTemplate: RegExp = /^CREATE .* EVENT /;

export default function eventDump(sqlFilesPath: string, connectionOptions: ConnectionObject) {

  let db: Pool;

  async function getEvent(dbName: string) {
    let events: Array<Event>;

    const res = await db.query(`SHOW EVENTS FROM ${dbName};`);

    if (Array.isArray(res[0])) {
      events = res[0].map((el) => ({ db: dbName, name: el.Name }));
    }

    return events;
  }

  async function getAllEvents(dataBases: Array<string>): Promise<Array<Event>> {
    const tableResp: Array<Array<Event>> = await Promise.all(dataBases.map(async (dbName: string) => {
      return getEvent(dbName);
    }));

    return tableResp.flat();
  }

  async function saveAllEvents() {
    db = await getPoolConnection(connectionOptions);

    const dataBases: Array<string> = await getDatabaseList(db);
    const events: Array<Event> = await getAllEvents(dataBases);

    await Promise.allSettled(events.map(async (event: Event) => {
      const res = await db.query(`SHOW CREATE EVENT ${event.db}.${event.name};`);

      if (res[0] && res[0][0] && (res[0][0]['Create Event'])) {
        const createText: string = insertIntoText(res[0][0]['Create Event'], createTemplate, `\`${event.db}\`.`);
        await saveToFile(sqlFilesPath, `${event.db}/EVENT`, `${event.name}.sql`, createText);
        console.log(`Save EVENT ${event.db}.${event.name}`);
      }

      return true;
    }));

    db.end();
  }

  return { saveAllEvents };
}