import fs from 'fs';
import { promisify } from 'util';

import { Pool } from 'mysql2/promise';
import moment from 'moment';

const asyncExist = promisify(fs.exists);
const asyncWrite = promisify(fs.writeFile);
const asyncMkdir = promisify(fs.mkdir);
const asyncRead = promisify(fs.readFile);

export async function getDatabaseList(db: Pool): Promise<string[]> {
  let dbList: Array<string>;

  const res = await db.query('SHOW DATABASES;');
  if (Array.isArray(res[0])) {
    dbList = res[0].map((el) => el.Database);
  }

  return dbList;
}

export async function createDirIfNotExist(path: string) {
  if (!(await asyncExist(path))) {
    await asyncMkdir(path, { recursive: true });
  }
}

function getObjectValue(obj: object, field: string) {
  let value: string | number | null | boolean;

  if (typeof obj[field] === 'string') {
    value = `'${obj[field]}'`;
  } else if (typeof obj[field] === 'object' && obj[field] instanceof Date) {
    value = `'${moment(obj[field]).format('YYYY-MM-DD hh:mm:ss')}'`;
  } else if (typeof obj[field] === 'object') {
    value = `'${JSON.stringify(obj[field])}'`;
  } else {
    value = obj[field]
  }

  return value;
}

export function generateInsertCode(queryResult: Array<any>, fullTableName: string): string {
  if (queryResult.length < 2) return '';
  const fields: Array<string> = queryResult[1].map((field) => field.name);
  const data: Array<object> = queryResult[0];
  const strData: Array<string> = data.map((el: object) => `(${fields.map((field: string) => getObjectValue(el, field)).join()})`);

  let result: string = `INSERT INTO ${fullTableName} (${fields.join()}) VALUES \n${strData.join(',\n')};`;
  return result;
}

export async function saveToFile(sqlDirPath: string, filePath: string, filename: string, fileContent: string) {
  const fullFilePath = `${sqlDirPath}/${filePath}`;

  await createDirIfNotExist(fullFilePath);

  await asyncWrite(`${fullFilePath}/${filename}`, fileContent, 'utf8');
}

export async function readFromFile(sqlDirPath: string, filePath: string) {
  const fullFilePath = `${sqlDirPath}/${filePath}`;

  if (await asyncExist(fullFilePath)) {
    return asyncRead(fullFilePath, 'utf8');
  }
  return undefined;
};
