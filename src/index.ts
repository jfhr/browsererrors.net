import { readErrorFromDatabase } from "./database";
import { renderSitemap } from "./sitemap";
import { 
    renderIndexPage,
    renderInformationPage,
    renderNotFoundPage,
    renderErrorPage,
    renderCodeNotFoundPage,
} from "./website";

async function updateDatabase() {
    console.log('browsererrors: updating database');
    console.time('browsererrors: update database timer');

    const bun = Bun.env.BUN_PATH ?? 'bun';
    const process = Bun.spawn([bun, 'run', './src/update.ts'], {
        onExit(proc, exitCode, signalCode, error) {
            console.log('browsererrors: updated database - exit code: ' + exitCode);
            console.timeEnd('browsererrors: update database timer');
        }
    });

    await process.exited;
}

async function scheduleDatabaseUpdates() {
    setInterval(updateDatabase, 24 * 60 * 60 * 1000);
}

function fixErrorCode(code: string): string {
    code = code.trim().toUpperCase();
    if (code.startsWith('ERR_')) {
        code = 'NET::' + code;
    }
    return code;
}

function createServer() {
    return {
        fetch(req: Request) {
            if (req.method === 'OPTIONS') {
                return new Response(
                    '', 
                    { status: 204, headers: { allow: 'HEAD,GET,OPTIONS' } }
                );
            }
            if (req.method !== 'GET' && req.method !== 'HEAD') { 
                return new Response(
                    'Method Not Allowed',
                    { status: 405, headers: { 'content-type': 'text/plain' } }
                );
            }

            const url = new URL(req.url);
            if (url.pathname === '/index.css') {
                if (req.method === 'HEAD') {
                    return new Response('', { status: 200, headers: { 'content-type': 'text/css' } });
                }
                return new Response(Bun.file('src/index.css'));
            }
            if (url.pathname === '/') {
                return new Response(
                    req.method === 'HEAD' ? '' : renderIndexPage(),
                    { status: 200, headers: { 'content-type': 'text/html' } }
                )
            }
            if (url.pathname === '/sitemap.txt') {
                return new Response(
                    req.method === 'HEAD' ? '' : renderSitemap(),
                    { status: 200, headers: { 'content-type': 'text/plain' } }
                )
            }
            if (url.pathname === '/search.php') {
                if (url.searchParams.has('code')) {
                    const code = fixErrorCode(url.searchParams.get('code')!);
                    url.pathname = `/error/${code}`;
                    url.searchParams.delete('code');
                    return new Response('', { status: 302, headers: { location: url.toString() } });
                }
                return new Response(
                    req.method === 'HEAD' ? '' : renderNotFoundPage(),
                    { status: 404, headers: { 'content-type': 'text/html' } }
                )
            }
            {
                const match = url.pathname.match(/^\/error\/(?<code>[^\/]*)\/?$/);
                if (match?.groups) {
                    const code = fixErrorCode(match.groups.code);
                    const error = readErrorFromDatabase(code);
                    if (error) {
                        return new Response(
                            req.method === 'HEAD' ? '' : renderInformationPage(error),
                            { status: 200, headers: { 'content-type': 'text/html' } }
                        )
                    }
                    return new Response(
                        req.method === 'HEAD' ? '' : renderCodeNotFoundPage(code),
                        { status: 404, headers: { 'content-type': 'text/html' } }
                    )
                }
            }
            {
                const match = url.pathname.match(/^\/api\/(?<code>.*).json$/);
                if (match?.groups) {
                    const { code } = match.groups;
                    const error = readErrorFromDatabase(code);
                    if (error) {
                        return new Response(
                            req.method === 'HEAD' ? '' : JSON.stringify(error),
                            { status: 200, headers: { 'content-type': 'application/json' } }
                        )
                    }
                    return new Response(
                        req.method === 'HEAD' ? '' : 'Not Found',
                        { status: 404, headers: { 'content-type': 'text/plain' } }
                    )
                }
            }
            return new Response(
                req.method === 'HEAD' ? '' : renderNotFoundPage(),
                { status: 404, headers: { 'content-type': 'text/html' } }
            )
        },
        error(e: Error) {
            return new Response(
                renderErrorPage(e),
                { status: 500, headers: { 'content-type': 'text/plain' } }
            );
        }
    };
}

updateDatabase();
scheduleDatabaseUpdates();
const server = Bun.serve(createServer());
console.log(`browserrors.net: server listening on: ${server.protocol}://${server.hostname}:${server.port} (development=${server.development})`);
