import * as child_process from 'child_process';
import * as http from 'http';
import * as fs from 'fs';
import { readErrorFromDatabase } from "./database.js";
import { renderSitemap } from "./sitemap.js";
import { 
    renderIndexPage,
    renderInformationPage,
    renderNotFoundPage,
    renderErrorPage,
    renderCodeNotFoundPage,
} from "./website.js";

async function updateDatabase() {
    console.log('browsererrors: updating database');
    console.time('browsererrors: update database timer');

    const node = process.env.NODE_PATH ?? 'node';
    const cp = child_process.spawn(node, ['./src/update.js']);

    const exitCode = await new Promise((resolve, reject) => { 
        cp.on('exit', code => resolve(code));
        cp.on('error', error => reject(error));
    });
    console.log('browsererrors: updated database - exit code: ' + exitCode);
    console.timeEnd('browsererrors: update database timer');
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
    return http.createServer((req, res) => {
        if (req.method === 'OPTIONS') {
            res.writeHead(204, { allow: 'HEAD,GET,OPTIONS' });
            res.end();
            return;
        }
        if (req.method !== 'HEAD' && req.method !== 'GET') {
            res.writeHead(405, { 'content-type': 'text/plain' });
            res.end('Method Not Allowed');
            return;
        }

        const url = new URL(req.url!, `http://${req.headers.host}`);
        if (url.pathname === '/index.css') {
            res.writeHead(200, { 'content-type': 'text/css' });
            if (req.method === 'HEAD') { 
                res.end();
                return; 
            }
            fs.createReadStream('src/index.css').pipe(res);
            return;
        }
        if (url.pathname === '/') {
            res.writeHead(200, { 'content-type': 'text/html' });
            res.end(req.method === 'HEAD' ? '' : renderIndexPage());
            return;
        }
        if (url.pathname === '/sitemap.txt') {
            res.writeHead(200, { 'content-type': 'text/plain' });
            res.end(req.method === 'HEAD' ? '' : renderSitemap());
            return;
        }
        if (url.pathname === '/search.php') {
            if (url.searchParams.has('code')) {
                const code = fixErrorCode(url.searchParams.get('code')!);
                url.pathname = `/error/${code}`;
                url.searchParams.delete('code');
                res.writeHead(302, { location: url.toString() });
                res.end();
                return;
            }
            res.writeHead(404, { 'content-type': 'text/html' });
            res.end(req.method === 'HEAD' ? '' : renderNotFoundPage());
            return;
        }
        {
            const match = url.pathname.match(/^\/error\/(?<code>[^\/]*)\/?$/);
            if (match?.groups) {
                const { code } = match.groups;
                const error = readErrorFromDatabase(code);
                if (error) {
                    res.writeHead(200, { 'content-type': 'text/html' });
                    res.end(req.method === 'HEAD' ? '' : renderInformationPage(error));
                    return;
                }
                res.writeHead(404, { 'content-type': 'text/html' });
                res.end(req.method === 'HEAD' ? '' : renderCodeNotFoundPage(code));
                return;
            }
        }
        {
            const match = url.pathname.match(/^\/api\/(?<code>.*).json$/);
            if (match?.groups) {
                const { code } = match.groups;
                const error = readErrorFromDatabase(code);
                if (error) {
                    res.writeHead(200, { 'content-type': 'application/json' });
                    res.end(req.method === 'HEAD' ? '' : JSON.stringify(error));
                    return;
                }
                res.writeHead(404, { 'content-type': 'text/plain' });
                res.end(req.method === 'HEAD' ? '' : 'Not Found');
                return;
            }
        }
        res.writeHead(404, { 'content-type': 'text/html' });
        res.end(req.method === 'HEAD' ? '' : renderNotFoundPage());
    });
}

updateDatabase();
scheduleDatabaseUpdates();
const port = process.env.PORT ? parseInt(process.env.PORT) : 8080;
createServer().listen(port);
