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
- [Https Server](/http4js/Https-server/#https-server)
- [Proxy](/http4js/Proxy/#proxy)
- [Use in Javascript](/http4js/Use-in-javascript/#how-to-require-and-use-http4js-in-js)
- [Example App](https://github.com/TomShacham/http4js-eg)

# End to End Testing

If we have called `asServer()` then our `Routing` knows about a server.

We can then call `serveE2E(req)` with a `Req` and it will start the server,
pass the `Req` to our `HttpClient` which will make the `Req` over the wire.
We then call `stop()` on the server... and we have served a `Req` end to end!

```typescript
const routing = get("/path", async (req: Req) => ResOf(200))
    .asServer()
    
routing.serveE2E(ReqOf("GET", "/path"))
     
/*
Res {
  headers: 
   { date: 'Tue, 26 Jun 2018 08:04:21 GMT',
     connection: 'close',
     'transfer-encoding': 'chunked' },
  status: 200,
  body: '' }
 */
```
This is a quick way to write end to end tests.

Prev: [In Memory Testing](/http4js/In-memory-testing/#in-memory-testing)

Next: [Approval testing with fakes](/http4js/Approval-testing-with-fakes/#approval-testing-with-fakes)
