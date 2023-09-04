import * as fs from "fs/promises";
import * as ejs from "ejs";
import { downloadChromeErrors } from "./src/chrome.js";
import { downloadFirefoxErrors } from "./src/firefox.js";

const WEB_PREFIX = `https://browsererrors.net`;

/** @type {string|null} */
let htmlTemplate = null;
async function readHTMLTemplate() {
  return htmlTemplate ??= await fs.readFile('./src/templates/error.ejs', 'utf-8');
}

/**
 * @param {import("./src/chrome.js").ErrorDefinition} error 
 */
async function writeToAPI(error) {
  await fs.writeFile(`./www/api/${error.code}.json`, JSON.stringify(error), 'utf-8');
}

/**
 * @param {import("./src/chrome.js").ErrorDefinition} error 
 */
async function writeHTML(error) {
  const template = await readHTMLTemplate();
  const renderedHTML = ejs.render(template, { error });
  await fs.mkdir(`./www/error/${error.code}`, { recursive: true });
  await fs.writeFile(`./www/error/${error.code}/index.html`, renderedHTML, 'utf-8');
}

async function downloadCSS() {
  const url = 'https://cdn.jsdelivr.net/npm/@picocss/pico@1/css/pico.classless.min.css';
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`GET ${url}: ${response.status}`);
  }
  const css = await response.text();
  await fs.writeFile('./www/index.css', css, 'utf-8');
}

/**
 * @param {import("./src/chrome.js").ErrorDefinition[]} errors
 */
async function writeSitemap(errors) {
  const sitemap = errors.map(error => `${WEB_PREFIX}/error/${error.code}`).join('\n');
  await fs.writeFile('./www/sitemap.txt', sitemap, 'utf-8');
}

/**
 * @param {import("./src/chrome.js").ErrorDefinition[]} errors
 */
async function writeErrorsJSON(errors) {
  await fs.writeFile('./www/api/errors.json', JSON.stringify(errors), 'utf-8');
}

async function main() {
  const errorResults = await Promise.all([
    downloadChromeErrors(),
    downloadFirefoxErrors(),
  ]);
  const errors = errorResults.flat();
  
  await fs.mkdir('./www/api', { recursive: true });
  await Promise.all([
    ...errors.map(writeToAPI),
    ...errors.map(writeHTML),
    downloadCSS(),
    writeSitemap(errors),
    writeErrorsJSON(errors),
  ]);
}

main();
