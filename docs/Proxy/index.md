# http4js

### Table of Contents

- [Overview](/http4js/#basics)
- [Handlers and Filters](/http4js/Handlers-and-filters/#handlers-and-filters)
- [Request and Response API](/http4js/Request-and-response-api/#request-and-response-api)
- [URI API](/http4js/Uri-api/#uri-api)
- [Routing API](/http4js/Routing-api/#routing-api)
- [In Memory Testing](/http4js/In-memory-testing/#in-memory-testing)
- [End to End Testing](/http4js/End-to-end-testing/#end-to-end-testing)
- [Approval testing with fakes](/http4js/Approval-testing-with-fakes/#approval-testing-with-fakes)
- [Express or Koa Backend](/http4js/Express-or-koa-backend/#express-or-koa-backend)
- [Proxy](/http4js/Proxy/#proxy)
- [Use in Javascript](/http4js/Use-in-javascript/#how-to-require-and-use-http4js-in-js)
- [Example App](https://github.com/TomShacham/http4js-eg)

# Proxy

Writing a proxy might look like this:

```typescript
const upstream = routes(".*", ".*", async (req: Req) => {
    const response = ResOf(200, req.headers);
    console.log("*** UPSTREAM RESPONSE ***");
    console.log(response);
    return response;
})
    .asServer(new NativeServer(3001))
    .start();

const proxy = routes(".*", ".*", (req: Req) => {
    const rewrittenRequest = req.withUri("http://localhost:3001/")
        .withHeader("x-proxy", "header from proxy");
    console.log("*** REWRITTEN REQUEST ***");
    console.log(rewrittenRequest);
    return HttpClient(rewrittenRequest);
})
    .asServer(new NativeServer(3000))
    .start();

```

Now when we make a get request to `http://localhost:3000` we add our x-proxy header to it and rewrite the uri to `http://localhost:3001`.

```
*** REWRITTEN REQUEST ***
Req {
  headers:
   { host: 'localhost:3000',
     connection: 'keep-alive',
     'cache-control': 'max-age=0',
     'upgrade-insecure-requests': '1',
     'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.167 Safari/537.36',
     accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
     'accept-encoding': 'gzip, deflate, br',
     'accept-language': 'en-GB,en;q=0.9,en-US;q=0.8,pt;q=0.7',
     'x-proxy': 'header from proxy' },
  queries: {},
  form: {},
  method: 'GET',
  uri:
   Uri {
     matches: {},
     asNativeNodeRequest:
      Url {
        protocol: 'http:',
        slashes: true,
        auth: null,
        host: 'localhost:3001',
        port: '3001',
        hostname: 'localhost',
        hash: null,
        search: null,
        query: null,
        pathname: '/',
        path: '/',
        href: 'http://localhost:3001/' },
     template: '/',
     protocol: 'http:',
     auth: null,
     hostname: 'localhost',
     path: '/',
     port: '3001',
     query: null,
     href: 'http://localhost:3001/' },
  body: '',
  pathParams: {} }

*** UPSTREAM RESPONSE ***
Res {
  headers: {},
  body:
   { host: 'localhost:3000',
     connection: 'keep-alive',
     'cache-control': 'max-age=0',
     'upgrade-insecure-requests': '1',
     'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.167 Safari/537.36',
     accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
     'accept-encoding': 'gzip, deflate, br',
     'accept-language': 'en-GB,en;q=0.9,en-US;q=0.8,pt;q=0.7',
     'x-proxy': 'header from proxy' },
  status: 200 }

```

Prev: [Express or Koa Backend](/http4js/Express-or-koa-backend/#express-or-koa-backend)
      
Next: [Use in Javascript](/http4js/Use-in-javascript/#how-to-require-and-use-http4js-in-js)
