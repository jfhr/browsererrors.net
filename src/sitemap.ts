import { readAllErrorCodesFromDatabase } from "./database";

export function renderSitemap() {
  const codes = readAllErrorCodesFromDatabase();
  return codes.map(code => `https://browsererrors.net/error/${code}`).join('\n');
}