import { readAllErrorCodesFromDatabase } from "./database.js";

export function renderSitemap() {
  const codes = readAllErrorCodesFromDatabase();
  return codes.map(code => `https://browsererrors.net/error/${code}`).join('\n');
}