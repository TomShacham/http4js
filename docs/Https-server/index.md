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
- [Writing a Proxy](/http4js/Proxy/#proxy)
- [Use in Javascript](/http4js/Use-in-javascript/#how-to-require-and-use-http4js-in-js)
- [Example App](https://github.com/TomShacham/http4js-eg)

# Https server

In order to serve an HTTPS server, you simply pass in a NativeHttpsServer
on the port you like, and provide it your `cert`, `ca cert` and `private key`.


```typescript
const certs = {
    key: fs.readFileSync('src/ssl/key.pem'),
    cert: fs.readFileSync('src/ssl/fullchain.pem'),
    ca: fs.readFileSync('src/ssl/my-root-ca.cert.pem'),
};

get("/path", async () => ResOf(200, "OK"))
    .asServer(new NativeHttpsServer(8000, certs)) // default value
    .start();
```

# How to generate certs locally

I have left notes in the [README](https://github.com/TomShacham/http4js/blob/master/README.md#running-https-server-tests)


Prev: [Approval testing with fakes](/http4js/Approval-testing-with-fakes/#approval-testing-with-fakes)

Next: [Writing a Proxy](/http4js/Proxy/#proxy)
