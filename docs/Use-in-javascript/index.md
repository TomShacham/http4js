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
- [Zipkin tracing](/http4js/Zipkin-tracing/#zipkin-tracing)
- [Express or Koa Backend](/http4js/Express-or-koa-backend/#express-or-koa-backend)
- [Https Server](/http4js/Https-server/#https-server)
- [Proxy](/http4js/Proxy/#proxy)
- [Use in Javascript](/http4js/Use-in-javascript/#how-to-require-and-use-http4js-in-js)
- [Example App](https://github.com/TomShacham/http4js-eg)

# How to require and use http4js in js

```text
yarn add http4js
```

```javascript
const http4js = require('http4js');
const Res = http4js.Res;
const Method = http4js.Method;
const routes = http4js.routes;

routes(Method.GET, "/", async (req) => new Res(200, "OK"))
    .asServer()
    .start();
```

Prev: [Proxy](/http4js/Proxy/#proxy)

Next: [Example App](https://github.com/TomShacham/http4js-eg)
