import Database from "better-sqlite3";
import { downloadChromeErrors } from "./chrome.js";
import { downloadFirefoxErrors } from "./firefox.js";



export async function updateFromSources() {
  const errorResults = await Promise.all([
    downloadChromeErrors(),
    downloadFirefoxErrors(),
  ]);
  const errors = errorResults.flat();

  const db = new Database("browsererrors.sqlite");
  
  db.prepare(`CREATE TABLE IF NOT EXISTS errors (
    code TEXT PRIMARY KEY ON CONFLICT REPLACE NOT NULL,
    browser TEXT NOT NULL,
    comment TEXT NOT NULL,
    file TEXT NOT NULL,
    line INTEGER NOT NULL
  )`).run();

  const insertQuery = db.prepare(
    'INSERT INTO errors (browser, code, comment, file, line) VALUES (?, ?, ?, ?, ?)'
  );
  const insertTransaction = db.transaction((/** @type {import("./chrome.js").ErrorDefinition[]} */ errors) => {
    for (const error of errors) {
      insertQuery.run(
        error.browser,
        error.code,
        error.comment,
        error.file,
        error.line,
      );
    }
  });
  insertTransaction(errors);
}
