import Database from "better-sqlite3";
import { ErrorDefinition } from "./types.js";

export function readErrorFromDatabase(code: string): ErrorDefinition|null {
  const db = new Database("browsererrors.sqlite");  
  return db.prepare('SELECT * FROM errors WHERE code = ?').get(code);
}

export function readAllErrorCodesFromDatabase(): string[] {
  const db = new Database("browsererrors.sqlite");
  return db.prepare('SELECT code FROM errors').all().map(row => row.code);
}
