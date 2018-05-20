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
- [Proxy](/http4js/Proxy/#proxy)
- [Example App](https://github.com/TomShacham/http4js-eg)

## Basics

http4js provides a server and a client.

A server is simply a route with a function `(Request) => Promise<Response>` attached to it.
We can choose to keep the server in memory or start it on a port:

```typescript
 
//server is just a route with a handler: (Request) => Promise<Response>
routes("GET", "/", (req: Request) => Promise.resolve(new Response(200)))
    //.asServer() //if we want to start the server
    //.start()
```

Our client has the same interface `(Request) => Promise<Response>`.

## Hello world

```typescript
 
routes("GET", "/", (req: Request) => Promise.resolve(new Response(200)))
    .asServer()
    .start();
 
const response = await HttpClient(new Request("GET", "http://localhost:3000/path"));
console.log(response);
     
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

## History and Design

http4js is a port of [http4k](https://github.com/http4k/http4k): 
an HTTP toolkit written in Kotlin that enables the serving and 
consuming of HTTP services in a functional and consistent way. 

This seemingly basic idea is the beauty and power of http4js and the SaaF (Server as a Function) concept.

We translate a wire request into a Request object. 
Our server is a function from Request -> Promise<Response>.
We translate a Response to a wire response. 

We write all our routing logic with our Routing domain object.
This object allows us to serve requests in memory, or over the wire.
Hence the only added benefit of functional testing is to test the translation between wire and domain.
