# BrowserErrors.net

[BrowserErrors.net](https://BrowserErrors.net) is a website that provides details on error codes used in Google Chrome and Mozilla Firefox, from the source code of those browsers. 

To run the website on your own machine: clone the git repository or download the source code and run:

```shell
bun run ./src/index.ts
```

To run the node.js version:

```shell
git switch nodejs
npx tsc
node ./src/index.js
```

## Performance comparison between Bun and node.js

There are two implementations of the browsererrors.net site: The Bun implementation on the `main` branch, and the node.js implementation on the `nodejs` branch.
The Bun implementation uses Bun's built-in [HTTP server](https://bun.sh/docs/api/http) and [SQLite](https://bun.sh/docs/api/sqlite) libraries. 
The node.js version uses the built-in `node:http` server and the third-party `better-sqlite3` library.
I deployed each version on the same server and ran several load testing tools to compare their performance.

**Tl;dr** node.js was moderately faster for requests involving a database read. Bun was minimally faster for serving a static file.

### loadtest

Uses the [loadtest](https://github.com/alexfernandez/loadtest) tool on Node.js.

#### loadtest - Bun version
```
$ npx loadtest -k https://browsererrors.net/error/NET::ERR_UNSAFE_PORT/
Requests: 1409, requests per second: 282, mean latency: 34.7 ms
Requests: 1408, requests per second: 282, mean latency: 34.7 ms
Requests: 1415, requests per second: 283, mean latency: 34.6 ms
Requests: 1404, requests per second: 281, mean latency: 34.8 ms
Requests: 2488, requests per second: 216, mean latency: 45.8 ms

Target URL:          https://browsererrors.net/error/NET::ERR_UNSAFE_PORT/
Max time (s):        10
Concurrent clients:  40
Running on cores:    4
Agent:               keepalive

Completed requests:  9955
Total errors:        0
Total time:          10.004 s
Mean latency:        39.5 ms
Effective rps:       995

Percentage of requests served within a certain time
  50%      35 ms
  90%      56 ms
  95%      67 ms
  99%      98 ms
 100%      211 ms (longest request)
```

#### loadtest - Bun version - static file
```
npx loadtest -k https://browsererrors.net/index.css                  

Requests: 451, requests per second: 90, mean latency: 107.8 ms
Requests: 431, requests per second: 86, mean latency: 113.1 ms
Requests: 465, requests per second: 93, mean latency: 104.6 ms
Requests: 463, requests per second: 93, mean latency: 105 ms

Target URL:          https://browsererrors.net/index.css
Max time (s):        10
Concurrent clients:  40
Running on cores:    4
Agent:               keepalive

Completed requests:  3814
Total errors:        0
Total time:          10.012 s
Mean latency:        103.5 ms
Effective rps:       381

Percentage of requests served within a certain time
  50%      95 ms
  90%      153 ms
  95%      191 ms
  99%      355 ms
 100%      727 ms (longest request)
```

#### loadtest - node.js version
```
$ npx loadtest -k https://browsererrors.net/error/NET::ERR_UNSAFE_PORT/
Requests: 1501, requests per second: 300, mean latency: 32.6 ms
Requests: 1499, requests per second: 300, mean latency: 32.7 ms
Requests: 1515, requests per second: 303, mean latency: 32.3 ms
Requests: 1487, requests per second: 297, mean latency: 32.9 ms

Target URL:          https://browsererrors.net/error/NET::ERR_UNSAFE_PORT/
Max time (s):        10
Concurrent clients:  40
Running on cores:    4
Agent:               keepalive

Completed requests:  13241
Total errors:        0
Total time:          10.005 s
Mean latency:        29.6 ms
Effective rps:       1323

Percentage of requests served within a certain time
  50%      26 ms
  90%      43 ms
  95%      50 ms
  99%      85 ms
 100%      140 ms (longest request)
```

#### loadtest - node.js version - static file
```
npx loadtest -k https://browsererrors.net/index.css
Requests: 498, requests per second: 100, mean latency: 98.8 ms
Requests: 475, requests per second: 95, mean latency: 103.1 ms
Requests: 463, requests per second: 93, mean latency: 105.6 ms
Requests: 453, requests per second: 91, mean latency: 108 ms

Target URL:          https://browsererrors.net/index.css
Max time (s):        10
Concurrent clients:  40
Running on cores:    4
Agent:               keepalive

Completed requests:  3906
Total errors:        0
Total time:          10.006 s
Mean latency:        101.3 ms
Effective rps:       390

Percentage of requests served within a certain time
  50%      95 ms
  90%      151 ms
  95%      185 ms
  99%      323 ms
 100%      945 ms (longest request)
```

### autocannon

Uses the [autocannon](https://github.com/mcollina/autocannon) tool on Node.js.

#### autocannon - Bun version
```
$ npx autocannon  https://browsererrors.net/error/NET::ERR_UNSAFE_PORT/
Running 10s test @ https://browsererrors.net/error/NET::ERR_UNSAFE_PORT/
10 connections


┌─────────┬───────┬───────┬────────┬────────┬──────────┬──────────┬────────┐
│ Stat    │ 2.5%  │ 50%   │ 97.5%  │ 99%    │ Avg      │ Stdev    │ Max    │
├─────────┼───────┼───────┼────────┼────────┼──────────┼──────────┼────────┤
│ Latency │ 14 ms │ 17 ms │ 104 ms │ 110 ms │ 22.88 ms │ 20.66 ms │ 138 ms │
└─────────┴───────┴───────┴────────┴────────┴──────────┴──────────┴────────┘
┌───────────┬─────────┬─────────┬─────────┬────────┬─────────┬────────┬─────────┐
│ Stat      │ 1%      │ 2.5%    │ 50%     │ 97.5%  │ Avg     │ Stdev  │ Min     │
├───────────┼─────────┼─────────┼─────────┼────────┼─────────┼────────┼─────────┤
│ Req/Sec   │ 268     │ 268     │ 396     │ 563    │ 427.8   │ 98.85  │ 268     │
├───────────┼─────────┼─────────┼─────────┼────────┼─────────┼────────┼─────────┤
│ Bytes/Sec │ 1.05 MB │ 1.05 MB │ 1.55 MB │ 2.2 MB │ 1.67 MB │ 386 kB │ 1.05 MB │
└───────────┴─────────┴─────────┴─────────┴────────┴─────────┴────────┴─────────┘

Req/Bytes counts sampled once per second.
# of samples: 10

4k requests in 10.05s, 16.7 MB read
```

#### autocannon - Bun version - static file
```
$ npx autocannon https://browsererrors.net/index.css                  
Running 10s test @ https://browsererrors.net/index.css
10 connections


┌─────────┬───────┬───────┬───────┬───────┬──────────┬─────────┬────────┐
│ Stat    │ 2.5%  │ 50%   │ 97.5% │ 99%   │ Avg      │ Stdev   │ Max    │
├─────────┼───────┼───────┼───────┼───────┼──────────┼─────────┼────────┤
│ Latency │ 21 ms │ 24 ms │ 38 ms │ 53 ms │ 25.16 ms │ 7.32 ms │ 152 ms │
└─────────┴───────┴───────┴───────┴───────┴──────────┴─────────┴────────┘
┌───────────┬─────────┬─────────┬─────────┬─────────┬───────┬─────────┬─────────┐
│ Stat      │ 1%      │ 2.5%    │ 50%     │ 97.5%   │ Avg   │ Stdev   │ Min     │
├───────────┼─────────┼─────────┼─────────┼─────────┼───────┼─────────┼─────────┤
│ Req/Sec   │ 339     │ 339     │ 401     │ 411     │ 389.4 │ 25.89   │ 339     │
├───────────┼─────────┼─────────┼─────────┼─────────┼───────┼─────────┼─────────┤
│ Bytes/Sec │ 24.4 MB │ 24.4 MB │ 28.8 MB │ 29.5 MB │ 28 MB │ 1.86 MB │ 24.3 MB │
└───────────┴─────────┴─────────┴─────────┴─────────┴───────┴─────────┴─────────┘

Req/Bytes counts sampled once per second.
# of samples: 10

4k requests in 10.04s, 280 MB read
```


#### autocannon - node.js version
```
$ npx autocannon  https://browsererrors.net/error/NET::ERR_UNSAFE_PORT/
Running 10s test @ https://browsererrors.net/error/NET::ERR_UNSAFE_PORT/
10 connections


┌─────────┬───────┬───────┬───────┬───────┬──────────┬─────────┬───────┐
│ Stat    │ 2.5%  │ 50%   │ 97.5% │ 99%   │ Avg      │ Stdev   │ Max   │
├─────────┼───────┼───────┼───────┼───────┼──────────┼─────────┼───────┤
│ Latency │ 14 ms │ 17 ms │ 40 ms │ 48 ms │ 17.94 ms │ 6.49 ms │ 91 ms │
└─────────┴───────┴───────┴───────┴───────┴──────────┴─────────┴───────┘
┌───────────┬─────────┬─────────┬─────────┬─────────┬─────────┬────────┬─────────┐
│ Stat      │ 1%      │ 2.5%    │ 50%     │ 97.5%   │ Avg     │ Stdev  │ Min     │
├───────────┼─────────┼─────────┼─────────┼─────────┼─────────┼────────┼─────────┤
│ Req/Sec   │ 473     │ 473     │ 540     │ 589     │ 542.3   │ 40.84  │ 473     │
├───────────┼─────────┼─────────┼─────────┼─────────┼─────────┼────────┼─────────┤
│ Bytes/Sec │ 1.85 MB │ 1.85 MB │ 2.12 MB │ 2.31 MB │ 2.13 MB │ 160 kB │ 1.85 MB │
└───────────┴─────────┴─────────┴─────────┴─────────┴─────────┴────────┴─────────┘

Req/Bytes counts sampled once per second.
# of samples: 10

5k requests in 10.04s, 21.3 MB read
```

#### autocannon - node.js version - static file

```
$ npx autocannon  https://browsererrors.net/index.css
Running 10s test @ https://browsererrors.net/index.css
10 connections


┌─────────┬───────┬───────┬───────┬───────┬─────────┬─────────┬────────┐
│ Stat    │ 2.5%  │ 50%   │ 97.5% │ 99%   │ Avg     │ Stdev   │ Max    │
├─────────┼───────┼───────┼───────┼───────┼─────────┼─────────┼────────┤
│ Latency │ 21 ms │ 25 ms │ 51 ms │ 61 ms │ 27.3 ms │ 8.56 ms │ 122 ms │
└─────────┴───────┴───────┴───────┴───────┴─────────┴─────────┴────────┘
┌───────────┬─────────┬─────────┬─────────┬─────────┬─────────┬─────────┬─────────┐
│ Stat      │ 1%      │ 2.5%    │ 50%     │ 97.5%   │ Avg     │ Stdev   │ Min     │
├───────────┼─────────┼─────────┼─────────┼─────────┼─────────┼─────────┼─────────┤
│ Req/Sec   │ 265     │ 265     │ 374     │ 397     │ 359.4   │ 40.86   │ 265     │
├───────────┼─────────┼─────────┼─────────┼─────────┼─────────┼─────────┼─────────┤
│ Bytes/Sec │ 19.1 MB │ 19.1 MB │ 26.9 MB │ 28.6 MB │ 25.8 MB │ 2.94 MB │ 19.1 MB │
└───────────┴─────────┴─────────┴─────────┴─────────┴─────────┴─────────┴─────────┘

Req/Bytes counts sampled once per second.
# of samples: 10

4k requests in 10.04s, 258 MB read
```

