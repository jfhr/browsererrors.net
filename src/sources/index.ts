import { Database } from "bun:sqlite";
import { downloadChromeErrors } from "./chrome.js";
import { downloadFirefoxErrors } from "./firefox.js";



export async function updateFromSources() {
  const errorResults = await Promise.all([
    downloadChromeErrors(),
    downloadFirefoxErrors(),
  ]);
  const errors = errorResults.flat();

  const db = new Database("browsererrors.sqlite", { create: true });
  
  db.query(`CREATE TABLE IF NOT EXISTS errors (
    code TEXT PRIMARY KEY ON CONFLICT REPLACE NOT NULL,
    browser TEXT NOT NULL,
    comment TEXT NOT NULL,
    file TEXT NOT NULL,
    line INTEGER NOT NULL
  )`).run();

  const insertQuery = db.query(
    'INSERT INTO errors (browser, code, comment, file, line) VALUES ($browser, $code, $comment, $file, $line)'
  );
  const insertTransaction = db.transaction((/** @type {import("./chrome.js").ErrorDefinition[]} */ errors) => {
    for (const error of errors) {
      insertQuery.run({
        $browser: error.browser,
        $code: error.code,
        $comment: error.comment,
        $file: error.file,
        $line: error.line,
      });
    }
  });
  insertTransaction(errors);
}
