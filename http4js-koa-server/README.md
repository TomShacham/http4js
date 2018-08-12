# http4js-clients

This module provides an koa server.

## Adding to your project

```bash
npm i --save http4js-koa-server
```

## Example usage

For more information, read the full [docs](https://tomshacham.github.io/http4js).

```typescript
import * as Koa from "koa";
import {KoaServer} from "../src/KoaServer";

const bodyParser = require('koa-bodyparser');
const koaApp = new Koa();
koaApp.use(bodyParser());

koaApp.use((ctx, next) => {
    ctx.set("koa", "middleware");
    next();
});

const server = get("/", async (req) => {
    const query = req.query("tomQuery");
    return ResOf(200, req.bodyString())
        .withHeaders(req.headers)
        .withHeader("tomQuery", query || "no tom query");
})
    .asServer(new KoaServer(koaApp, 3002));

```