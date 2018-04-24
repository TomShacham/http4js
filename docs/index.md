# http4js

### Table of Contents

- [Overview](/http4js/#basics)
- [Intro](/http4js/Intro/#intro)
- [Handlers and Filters](/http4js/Handlers-and-filters/#Handlers-and-filters)
- [Request and Response API](/http4js/Request-and-response-api/#request-and-response-api)
- [URI API](/http4js/Uri-api/#uri-api)
- [In Memory Testing](/http4js/In-memory-testing/#in-memory-testing)
- [Approval testing with fakes](/http4js/Approval-testing-with-fakes/#approval-testing-with-fakes)
- [Express or Koa Backend](/http4js/Express-or-koa-backend/#express-or-koa-backend)
- [Proxy](/http4js/Proxy/#proxy)
- [Example App](https://github.com/TomShacham/http4js-eg)

## Basics

http4js provides a server and a client.

A server is simply a route with a function `(Request) => Promise<Response>` attached to it.
We can choose to keep the server in memory or start it on a port:

```typescript
//handler is just a function
type HttpHandler = (Request) => Promise<Response> 
 
const handler = (req: Request) => Promise.resolve(new Response(200));
 
//server is just a route with a handler
routes("GET", "/", handler)
    //.asServer(3000) //if we want to run on a port
    //.start()
```

Our client has the same interface `(Request) => Promise<Response>`.

## Hello world

```typescript
 
routes("GET", "/", (req: Request) => Promise.resolve(new Response(200))
    .asServer()
    .start();
 
HttpClient(new Request("GET", "http://localhost:3000/path"))
    .then(response => console.log(response));
     
/*
Response {
  headers: 
   { date: 'Sun, 25 Mar 2018 09:24:43 GMT',
     connection: 'close',
     'transfer-encoding': 'chunked' },
  body: Body { bytes: <Buffer > },
  status: 200 }
*/

```

## History and Design

http4js is a port of [http4k](https://github.com/http4k/http4k): an HTTP toolkit written in Kotlin that enables the serving and consuming of HTTP services in a functional and consistent way. Inspiration for http4js is entirely thanks to [David Denton](https://github.com/daviddenton) and [Ivan Sanchez](https://github.com/s4nchez). Thanks! 

If you wrote a thin API layer that translated the wire representation of HTTP into a few domain objects: Request, Response and Routing, and translated back again, you essentially wind up with the whole of http4js.

This seemingly basic idea is the beauty and power of http4js and the SaaF (Server as a Function) concept.

We translate a wire request into a Request object. Our server is a function from Request -> Response, we translate a Response to a wire response. 

We write all our routing logic with our ResourceRouting domain object. 

Hence we can run server in memory and test our entire stack and therefore the only added benefit of functional testing is to test the translation between wire and domain.
 
We inject all of our dependencies to our Server so testing using fakes is easy peasy. We can even write simple fakes of external dependencies and spin them up in memory. 
