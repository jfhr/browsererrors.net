import { Database } from "bun:sqlite";
import { ErrorDefinition } from "./types";

export function readErrorFromDatabase(code: string): ErrorDefinition|null {
  const db = new Database("browsererrors.sqlite");  
  return db.query('SELECT * FROM errors WHERE code = $code')
    .get({ $code: code });
}

export function readAllErrorsFromDatabase(): ErrorDefinition[] {
  const db = new Database("browsererrors.sqlite");
  return db.query('SELECT * FROM errors').all();
}
