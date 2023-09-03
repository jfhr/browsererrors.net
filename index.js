import * as fs from "fs/promises";
import * as ejs from "ejs";
import { downloadChromeErrors } from "./src/chrome.js";
import { downloadFirefoxErrors } from "./src/firefox.js";

/** @type {string|null} */
let htmlTemplate = null;
async function readHTMLTemplate() {
  return htmlTemplate ??= await fs.readFile('./src/error-template.ejs', 'utf-8');
}

/**
 * @param {import("./src/chrome.js").ErrorDefinition} error 
 */
async function writeToAPI(error) {
  const fileName = error.code.replace('::', '__');
  await fs.writeFile(`./www/api/${fileName}.json`, JSON.stringify(error), 'utf-8');
}

/**
 * @param {import("./src/chrome.js").ErrorDefinition} error 
 */
async function writeHTML(error) {
  const fileName = error.code.replace('::', '__');
  const template = await readHTMLTemplate();
  const renderedHTML = ejs.render(template, { error });
  await fs.mkdir(`./www/error/${fileName}`, { recursive: true });
  await fs.writeFile(`./www/error/${fileName}/index.html`, renderedHTML, 'utf-8');
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
  ]);
}

main();
