# http4js

### Table of Contents

- [Overview](/http4js)
- [Intro](/http4js/Intro)
- [In Memory Server](/http4js/In-memory)

## Basics

We provide a server and a client.

A server is simply a route with a handler attached to it and a handler is just a function.
We can choose to keep the server in memory or start it on a port:

```typescript
//handler is just a function
type HttpHandler = (Request) => Promise<Response> 
 
const handler = (req: Request) => {
    return new Promise(resolve => resolve(new Response(200)));
}
 
//server is just a route with a handler
routes("/", "GET", handler)
    //.asServer(3000) //if we want to run on a port
    //.start()
```

Our client has the same interface. It simply takes a `Request` and returns a `Promise<Response>`

## Hello world

```typescript
import {routes} from "./dist/main/core/RoutingHttpHandler";
import {Request} from "./dist/main/core/Request";
import {Response} from "./dist/main/core/Response";
import {HttpClient} from "./dist/main/core/Client";
 
routes("/", "GET", (req: Request) => {
  return new Promise(resolve => {
    resolve(new Response(200))
  })
})
    .asServer(3000)
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
