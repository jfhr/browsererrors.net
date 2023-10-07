import { errorHref, errorHrefNoscript } from "./references";
import { ErrorDefinition } from "./types";
import he from 'he';

function escapeHTML(text: string) {
    return he.escape(text);
}

function renderHead(title: string) {
    return `    
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${title}</title>
    <link rel="stylesheet" href="/index.css">
    <style>
        @media (min-width: 576px) {
            form[rel="search"] {
                display: flex;
                gap: var(--spacing);
            }
            form[rel="search"] button {
                max-width: 6em;
            }
        }
    </style>
</head>`;
}

function renderInlineScript() {
    return `
        <script>
        /**
         * @param {string} code
         * @returns {string}
         */
        function fixErrorCode(code) {
            code = code.trim();
            if (code.startsWith('ERR_')) {
                code = 'NET::' + code;
            }
            return code;
        }

        /** @type {HTMLFormElement} */
        const form = document.querySelector('form[rel="search"]');
        form.addEventListener('submit', event => {
            event.preventDefault();
            const data = new FormData(form);
            if (!data.has('code')) {
                return;
            }
            const code = fixErrorCode(data.get('code'));
            location.href = '/error/' + code;
        });
    </script>`
}

export function renderIndexPage() {
    return `<!DOCTYPE html>
<html lang="en">
${renderHead('BrowserErrors.net')}
<body>
    <main>
        <h1>BrowserErrors.net</h1>
        <p>
            BrowserErrors.net provides details on error codes used in Google Chrome and Mozilla Firefox,
            from the source code of those browsers.
        </p>
        <p>
            <label for="code">
                Enter a browser error code:
            </label>
        </p>
        <form action="/search.php" rel="search">
            <input type="text" name="code" id="code" required autofocus>
            <button>Search</button>
        </form>
        <p>
            For example:
            <ul>
                <li>
                    <small>
                        <a href="./error/NET::ERR_UNSAFE_PORT/">NET::ERR_UNSAFE_PORT</a>
                    </small>
                </li>
                <li>
                    <small>
                        <a href="./error/NET::ERR_CERT_SYMANTEC_LEGACY/">NET::ERR_CERT_SYMANTEC_LEGACY</a>
                    </small>
                </li> 
                <li>
                    <small>
                        <a href="./error/PR_ALREADY_INITIATED_ERROR/">PR_ALREADY_INITIATED_ERROR</a>
                    </small>
                </li>
            </ul>
        </p>
    </main>
    <hr>
    <footer>
        <p>
            This website, except where otherwise noted, is licensed under the 
            <a href="https://www.apache.org/licenses/LICENSE-2.0.txt" rel="license">
                Apache-2.0 License</a>.
            The source code is available 
            <a href="https://jfhr.de/source/jfhr/browsererrors.net">
                on jfhr.de</a> or
            <a href="https://github.com/jfhr/browsererrors.net">
                on GitHub.com</a>.
        </p>
    </footer>
    ${renderInlineScript()}
</body>
</html>`;
}

function renderSourceLink(error: ErrorDefinition) {
    const href = errorHref(error);
    const hrefNoscript = errorHrefNoscript(error);

    if (href !== hrefNoscript) {
        return `<noscript>
            <a href="${escapeHTML(hrefNoscript)}" rel="nofollow">
            ${escapeHTML(error.file)}, line ${escapeHTML(error.line.toString())}</a>.
        </noscript>
        <script>
            document.write(
                '<a href="${escapeHTML(href)}" rel="nofollow">'
                + '${escapeHTML(error.file)}, line ${escapeHTML(error.line.toString())}</a>.'
            );
        </script>`;
    }

    return `<a href="${escapeHTML(href)}" rel="nofollow">
            ${escapeHTML(error.file)}, line ${escapeHTML(error.line.toString())}</a>`;
}

function renderSourceAttribution(error: ErrorDefinition) {
    if (error.browser === 'Chrome') {
        return `This description is licensed under 
        <a href="https://chromium.googlesource.com/chromium/src/+/HEAD/LICENSE" rel="license">
            the Chromium license</a>.`;
    }
    return `This description is licensed under 
        <a href="https://www.mozilla.org/en-US/MPL/2.0/" rel="license">
            the Mozilla Public License</a>.`;
}

function renderFooter() {
    return `<footer>
        <p>
            BrowserErrors.net provides details on error codes used in Google Chrome and Mozilla Firefox,
            from the source code of those browsers.
        </p>
        <form action="/search.php" rel="search">
            <input type="text" name="code" id="code" required placeholder="Enter another error code">
            <button>Search</button>
        </form>
        <p>
            This website, except where otherwise noted, is licensed under the 
            <a href="https://www.apache.org/licenses/LICENSE-2.0.txt">
                Apache-2.0 License</a>.
            The source code is available 
            <a href="https://jfhr.de/source/jfhr/browsererrors.net">
                on jfhr.de</a> or
            <a href="https://github.com/jfhr/browsererrors.net">
                on GitHub.com</a>.
        </p>
    </footer>`;
}

export function renderInformationPage(error: ErrorDefinition) {
    return `<!DOCTYPE html>
    <html lang="en">
        ${renderHead(error.code)}
        <body>
            <main>
                <h1>
                    ${escapeHTML(error.code)}
                </h1>
                <p>
                    ${escapeHTML(error.code)} is an error in ${escapeHTML(error.browser)} with the description:
                </p>
                <pre><code>${escapeHTML(error.comment)}</code></pre>
                <p>
                    It is defined in the file
                    ${renderSourceLink(error)}
                </p>
                <p>
                    ${renderSourceAttribution(error)}
                </p>
            </main>
            <hr>
            ${renderFooter()}
            ${renderInlineScript()}
        </body>
    </html>`;
}

export function renderErrorPage(error: Error) {
    return 'Error: ' + error.message;
}

export function renderCodeNotFoundPage(code: string) {
    return `<!DOCTYPE html>
    <html lang="en">
        ${renderHead(code)}
        <body>
            <main>
                <h1>
                    Not found: ${escapeHTML(code)}
                </h1>
                <p>
                    ${escapeHTML(code)} is not a known error code.
                </p>
                <p>
                    If you have found this error code in a browser, please
                    <a href="https://github.com/jfhr/browsererrors.net/issues/new">
                        file an issue on GitHub</a>
                    or write an E-Mail to:
                    <a href="mailto:info@browsererrors.net?subject=${escapeHTML(code)}">
                        info@browsererrors.net</a>.
            </main>
            <hr>
            ${renderFooter()}
            ${renderInlineScript()}
        </body>
    </html>`;
}

export function renderNotFoundPage() {
    return `<!DOCTYPE html>
    <html lang="en">
        ${renderHead('Not found')}
        <body>
            <main>
                <h1>
                    Not found
                </h1>
                <p>
                    The requested page was not found.
                </p>
            </main>
            <hr>
            ${renderFooter()}
            ${renderInlineScript()}
        </body>
    </html>`;
}
