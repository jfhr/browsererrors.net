import { readAllErrorsFromDatabase } from "./database";

export function renderSitemap() {
  const errors = readAllErrorsFromDatabase();
  const urls = errors.map(error => `https://browsererrors.net/error/${error.code}`);
  return urls.join('\n');
}