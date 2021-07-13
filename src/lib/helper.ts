import fs from 'fs';
import { promisify } from 'util';

import mysql, { Pool } from 'mysql2/promise';

const asyncExist = promisify(fs.exists);
const asyncWrite = promisify(fs.writeFile);
const asyncMkdir = promisify(fs.mkdir);
const asyncRead = promisify(fs.readFile);
const asyncReadDir = promisify(fs.readdir);
const asyncLstat = promisify(fs.lstat);

export type ConnectionObject = {
  host: string;
  user: string;
  password: string;
  connectionLimit?: number;
  database?: string;
}

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

export async function saveToFile(sqlDirPath: string, filePath: string, filename: string, fileContent: string) {
  const fullFilePath = `${sqlDirPath}/${filePath}`;

  await createDirIfNotExist(fullFilePath);

  await asyncWrite(`${fullFilePath}/${filename}`, fileContent, 'utf8');
}

export async function readFromFile(fullFilePath: string) {
  if (await asyncExist(fullFilePath)) {
    return asyncRead(fullFilePath, 'utf8');
  }

  return undefined;
}

export async function getDirFiles(path: string, opositeDirFilter: Array<string>) {
  if (!(await asyncExist(path))) return undefined;

  return getDirContentRecursive(path, opositeDirFilter);
}

async function getDirContentRecursive(path: string, opositeDirFilter: Array<string>) {
  const dirContent: Array<string> = await asyncReadDir(path);
  let fileList: Array<string> = [];
  for (let dirElement of dirContent) {
    const elementPath: string = `${path}/${dirElement}`;
    const elementStat = await asyncLstat(elementPath);

    if (elementStat.isDirectory()) {
      if (!opositeDirFilter.includes(dirElement)) {
        fileList = [ ...fileList, ...(await getDirContentRecursive(elementPath, opositeDirFilter)) ];
      }      
    } else {
      fileList.push(elementPath);
    }
  }

  return fileList;
}

export async function getPoolConnection(connectionOptions: ConnectionObject): Promise<mysql.Pool> {
  return mysql.createPool(connectionOptions);
}

export function spliceString(text: string, index: number, replace: number, subStr: string): string {
  return text.slice(0, index) + subStr + text.slice(index + Math.abs(replace));
}

export function insertIntoText(text: string, searchTemplate: string | RegExp, subStr: string): string {
  let insertPlace: number = 0;

  if (typeof searchTemplate === 'string') {
    insertPlace = text.indexOf(searchTemplate) + searchTemplate.length;
  } else {
    const createTexts: Array<any> = text.match(searchTemplate);
    if (createTexts.length) insertPlace = createTexts['index'] + createTexts[0].length;
  }

  return spliceString(text, insertPlace, 0, subStr);
}

export async function getDirs(path: string) {
  return asyncReadDir(path);
}
