# http4js

### Table of Contents

- [Overview](/http4js/#basics)
- [Intro](/http4js/Intro/#intro)
- [Handlers and Filters](/http4js/Handlers-and-filters/#handlers-and-filters)
- [Request and Response API](/http4js/Request-and-response-api/#request-and-response-api)
- [URI API](/http4js/Uri-api/#uri-api)
- [In Memory Testing](/http4js/In-memory-testing/#in-memory-testing)
- [Approval testing with fakes](/http4js/Approval-testing-with-fakes/#approval-testing-with-fakes)
- [Express or Koa Backend](/http4js/Express-or-koa-backend/#express-or-koa-backend)
- [Writing a Proxy](/http4js/Proxy/#proxy)
- [Use in Javascript](/http4js/Use-in-javascript/#how-to-require-and-use-http4js-in-js)
- [Example App](https://github.com/TomShacham/http4js-eg)

# Express or Koa backend

http4js is just a thin layer between http and a nice in memory API. So
we can plug and play different backends. By default we just translate 
to and from node's in-built http layer. But http4js also provides a 
way to hook into Express or Koa, allowing you to use their features.

```typescript
get("/path", () => Promise.resolve(new Response(200, "OK")))
    .asServer(new NativeServer(3001)) // default value
    .start();
```

Calling `.asServer()` with no argument with default to `NativeServer` on port `3000`.
But we can also use an Express or Koa backend:
 
Express -

```typescript
import * as express from "express";

const expressApp = express();
expressApp.use(bodyParser.urlencoded({extended: true}));
expressApp.use(bodyParser.json());

expressApp.use((req, res, next) => {
    res.withHeader("express", "middleware");
    next();
});

get("/path", () => Promise.resolve(new Response(200, "OK")))
    .asServer(new ExpressServer(expressApp, 3001));

```

Koa -

```typescript
import {KoaServer} from "servers/KoaServer";

import * as Koa from "koa";

const bodyParser = require('koa-bodyparser');
const koaApp = new Koa();
koaApp.use(bodyParser());

koaApp.use((ctx, next) => {
    ctx.set("koa", "middleware");
    next();
});

get("/path", () => Promise.resolve(new Response(200, "OK")))
    .asServer(new KoaServer(koaApp, 3002))
    .start();
```

You can use all your favourite middleware and features from Express or Koa
and all the good stuff about http4js. 

## Under the covers

In order to be a backend for http4js, you just need to implement one 
function: `registerCatchAllHandler`. This function is responsible for 
listening for all requests and translating them into an http4js `Request`.
Once we have a `Request` we pass it to our `Routing` and get our 
`Promise<Response>`. 

Here is the code for the Express backend:

```typescript
    registerCatchAllHandler(routing: RoutingHttpHandler): void {
        this.routing = routing;
        this.server.use((req, res, next) => {
            const {headers, method, url} = req;
            let body = Object.keys(req.body).length == 0 ? [] : req.body;
            if (headers['content-type'] == 'application/json') body = [Buffer.from(JSON.stringify(body))];
            const response = this.createInMemResponse(body, method, url, headers);
            response.then(response => {
                Object.keys(response.headers).forEach(header => res.setHeader(header, response.headers[header]));
                res.end(response.body.bytes);
            });
            next();
        });
    }

    private createInMemResponse(chunks: Array<any>, method: any, url: any, headers: any): Promise<Response> {
        const inMemRequest = headers['content-type'] == 'application/x-www-form-urlencoded'
            ? new Request(method, url, JSON.stringify(chunks), headers).withForm(chunks)
            : new Request(method, url, new Body(Buffer.concat(chunks)), headers);
        return this.routing.serve(inMemRequest);
    }
```