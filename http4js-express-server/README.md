# http4js-clients

This module provides an express server.

## Adding to your project

```bash
npm i --save http4js-express-server
```

## Example usage

For more information, read the full [docs](https://tomshacham.github.io/http4js).

```typescript
import * as express from "express";
import {ExpressServer} from "../src/ExpressServer";

const expressApp = express();
expressApp.use(bodyParser.urlencoded({extended: true}));
expressApp.use(bodyParser.json());
expressApp.use((req, res, next) => {
    res.setHeader("express", "middleware");
    next();
});
        

const server = get("/", async (req) => {
    const query = req.query("tomQuery");
    return ResOf(200, req.bodyString())
        .withHeaders(req.headers)
        .withHeader("tomQuery", query || "no tom query")
})
    .asServer(new ExpressServer(expressApp, 3001));
```