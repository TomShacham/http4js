## http4js

A simple http library for typescript

Read the [docs](https://tomshacham.github.io/http4js/) here

#### To install:

`npm install --save http4js`

#### To run:

```
git clone git@github.com:TomShacham/http4js.git  cd http4js
npm install
tsc index.ts --target es5; node index.js
```

#### To test:

```
npm install
npm test
```

**In order to run tests in idea/webstorm**, you may need to:

```
npm install @types/mocha --save-dev
npm install ts-node      --save-dev
npm install typescript   --save-dev 
```

#### To do

- create Header and Method to wrap headers and method on req and provide convenience functions like Headers.CONTENT_TYPE and Method.GET
- document withFilter for eg to add user on req or upgrade http to https
- support express backend
- other client verbs, PUT, PATCH, HEAD etc.

#### Example

```typescript
import {Request} from "./dist/main/core/Request";
import {HttpHandler} from "./dist/main/core/HttpMessage";
import {routes} from "./dist/main/core/RoutingHttpHandler";
import {Response} from "./dist/main/core/Response";
import {HttpClient} from "./dist/main/core/Client";
import {Body} from "./dist/main/core/Body";
import {Uri} from "./dist/main/core/Uri";
 
let handler = (req: Request) => {
    let html = `<h1>${req.method} to ${req.uri.href} with headers ${Object.keys(req.headers)}</h1>`;
    return new Promise(resolve => resolve(new Response(200, new Body(Buffer.from(html)))));
};
 
let headerFilter = (handler: HttpHandler) => {
    return (req: Request) => {
        return handler(req.setHeader("filter", "1"));
    }
};
 
let moreRoutes = routes("/bob/{id}", "POST", (req) => {
    return new Promise(resolve => {
        resolve(new Response(201, new Body("created a " + req.path)))
    });
});
 
routes("/path", "GET", handler)
    .withHandler("/tom", "GET", handler)
    .withRoutes(moreRoutes)
    .withFilter(headerFilter)
    .asServer(3000)
    .start();
 

HttpClient(
    new Request("GET", Uri.of("http://localhost:3000/path/tom"))
).then(response => {
    console.log(response);
    console.log(response.bodyString());
});
 
/*
Response {
  headers: 
   { date: 'Sun, 25 Mar 2018 11:15:12 GMT',
     connection: 'close',
     'transfer-encoding': 'chunked' },
  body: 
   Body {
     bytes: <Buffer 3c 68 31 3e 47 45 54 20 74 6f 20 2f 70 61 74 68 2f 74 6f 6d 20 77 69 74 68 20 68 65 61 64 65 72 73 20 68 6f 73 74 2c 63 6f 6e 6e 65 63 74 69 6f 6e 2c ... > },
  status: 200 }
 
<h1>GET to /path/tom with headers host,connection,filter</h1>
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
