import { ErrorDefinition } from "../types.js";
import { iterateLines } from "./iterate-lines.js";

/**
* Parse error definitions in Firefox source code, e.g.
* @example
* parseFirefoxErrors(`
* /* Memory allocation attempt failed *${'/'}
* #define PR_OUT_OF_MEMORY_ERROR                   (-6000L)
* `);
* // yields:
* {
*   comment: 'Memory allocation attempt failed',
*   code: 'PR_OUT_OF_MEMORY_ERROR',
*   // href depends on line number
*   href: 'https://searchfox.org/mozilla-central/source/nsprpub/pr/include/prerr.h#3'
* }
*/
function *parseFirefoxErrors(text: string): Generator<ErrorDefinition> {
  const browser = 'Firefox';
  // Match firefox PR_*_ERROR definitions, e.g.
  // #define PR_OUT_OF_MEMORY_ERROR                   (-6000L)
  const errorRegExp = /#define\s+(?<code>PR_[A-Z0-9_]+_ERROR)/;

  // Track the line number to generate line-specific hyperlinks for each error code.
  // Initialize to 0, but increment for every line before processing, so we actually start with 1.
  let lineNumber = 0;
  // Comment for the current error. We count multiple lines of comment as one, but reset every time
  // we see a non-comment line. Currently only accounts for slash-asterisk comments.
  const commentLines: string[] = [];
  let isComment = true;
  
  for (let line of iterateLines(text)) {
    lineNumber++;

    if (line.startsWith('/*')) {
      isComment = true;
      line = line.substring(2).trim();
    }
    if (isComment) {
      if (line.includes('*/')) {
        isComment = false;
        line = line.substring(0, line.length -2).trim();
      }
      commentLines.push(line);
      continue;
    }

    let match = line.match(errorRegExp);
    if (match?.groups) {
      const comment = commentLines.splice(0).join(' ');
      const code = match.groups.code;
      const file = 'nsprpub/pr/include/prerr.h';
      yield { browser, comment, code, file, line: lineNumber };
    } else {
      commentLines.splice(0);
    }
  }
}

export async function downloadFirefoxErrors(): Promise<ErrorDefinition[]> {
 const url = 'https://hg.mozilla.org/mozilla-central/raw-file/default/nsprpub/pr/include/prerr.h';
 const response = await fetch(url);
 if (!response.ok) {
   throw new Error(`GET ${url}: ${response.status}`);
 }
 const text = await response.text();
 return [...parseFirefoxErrors(text)];
}
