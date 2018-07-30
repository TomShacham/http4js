# http4js

### Release notes

View [full release notes](/http4js/Release-notes/#release-notes)

### Table of Contents

- [Overview](/http4js/#intro)
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

# Intro

http4js is a thin layer around node http. 
Within this layer we can happily unit test our routing logic and easily spin up any function `(Request) => Promise<Response>` as a server.  

## Basic Server

We can route a path to a handler and start it as a server:

```typescript
routes("GET", "/path", async (req) => ResOf(200))
    .asServer()
    .start();
```

Then we can make a call to this endpoint

```typescript
HttpClient(new Request("GET", "http://localhost:3000/path"))
    .then(response => console.log(response));
     
/*
Response {
  headers: 
   { date: 'Sun, 25 Mar 2018 09:24:43 GMT',
     connection: 'close',
     'transfer-encoding': 'chunked' },
  body: '',
  status: 200 }
*/
```

## What's the big idea?

- Having our routing and logic separate from our server and http layer means that we can unit test them away from http so now we do not have to write end to end tests to test our routing. 
  
- The only added benefit of end to end tests now is to test the interaction with the http layer. Testing the http layer is very useful for certain situations, like making sure that certain headers are respected by node's http layer, or knowing that a certain query string is valid at the http layer, but to test our app and its logic, we no longer need to have slow and painful end to end tests. 

- `Req` and `Res` are immutable, so you cannot pass a mutable "context" around your code base and mutate it here and there. If you want to jimmy around with the incoming `Req` then you build a new one, luckily every method on `Req` returns a new `Req`, but if you want functions to change your `Req` it obviously has to explicitly return it as `Req` is immutable. The same goes for `Res`.


Next: [Handlers and Filters](/http4js/Handlers-and-filters/#handlers-and-filters)