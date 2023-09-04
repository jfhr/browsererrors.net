import { iterateLines } from "./iterate-lines.js";

/**
 * @typedef {{
 *   browser: string,
 *   code: string,
 *   comment: string,
 *   href: string,
 *   href_noscript?: string,
 *   file: string,
 *   line: number,
 * }} ErrorDefinition
 */

/**
 * Parse error definitions in Chrome source code, e.g.
 * @example
 * parseChromeErrors(`
 * // An asynchronous IO operation is not yet complete.  This usually does not
 * // indicate a fatal error.  Typically this error will be generated as a
 * // notification to wait for some external notification that the IO operation
 * // finally completed.
 * NET_ERROR(IO_PENDING, -1)
 * `);
 * // yields:
 * {
 *   comment: '// An asynchronous IO operation is not yet complete.  This usually does not\n' +
 *   '// indicate a fatal error.  Typically this error will be generated as a\n' +
 *   '// notification to wait for some external notification that the IO operation\n' +
 *   '// finally completed.',
 *   code: 'NET:ERR_IO_PENDING',
 *   // href depends on line number
 *   href: 'https://source.chromium.org/chromium/chromium/src/+/main:net/base/net_error_list.h;l=6'
 * }
 * 
 * @param {string} text
 * @returns {Generator<ErrorDefinition>}
 */
function *parseChromeErrors(text) {
  const browser = 'Chrome';
  // Match chrome NET_ERROR macros, e.g.
  // NET_ERROR(IO_PENDING, -1)
  const netErrorRegExp = /NET_ERROR\((?<shortcode>[A-Z0-9_]+),.*\)/;

  // Track the line number to generate line-specific hyperlinks for each error code.
  // Initialize to 0, but increment for every line before processing, so we actually start with 1.
  let lineNumber = 0;
  // Comment for the current error. We count multiple lines of comment as one, but reset every time
  // we see a non-comment line. Currently only accounts for double-slash comments.
  const commentLines = [];
  
  for (const line of iterateLines(text)) {
    lineNumber++;

    if (line.startsWith('//')) {
      commentLines.push(line);
      continue;
    }

    let match = line.match(netErrorRegExp);
    if (match) {
      const comment = commentLines.splice(0).join('\n');
      const code = 'NET::ERR_' + match.groups.shortcode;
      const file = 'net/base/net_error_list.h';
      const href_noscript = `https://chromium.googlesource.com/chromium/src/+/HEAD/net/base/net_error_list.h#${lineNumber}`;
      const href = `https://source.chromium.org/chromium/chromium/src/+/main:net/base/net_error_list.h;l=${lineNumber}`;
      yield { browser, comment, code, href, href_noscript, file, line: lineNumber };
    } else {
      commentLines.splice(0);
    }
  }
}

/**
 * @returns {Promise<ErrorDefinition[]>}
 */
export async function downloadChromeErrors() {
  const url = 'https://raw.githubusercontent.com/chromium/chromium/main/net/base/net_error_list.h';
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`GET ${url}: ${response.status}`);
  }
  const text = await response.text();
  return [...parseChromeErrors(text)];
}
