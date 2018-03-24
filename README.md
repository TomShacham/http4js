## Http4js

A port of [http4k](https://github.com/http4k/http4k): a lightweight _toolkit_ to allow in memory functional testing and to simplify working with HTTP. 

If you wrote a thin API layer that translated the wire representation of HTTP into a few domain objects: Request, Response and Routing, and translated back again, you essentially wind up with the whole of http4js.

This seemingly basic idea is the beauty and power of http4js and the SaaF (Server as a Function) concept.

We translate a wire request into a Request object. Our server is a function from Request -> Response, we translate a Response to a wire response. 

We write all our routing logic with our Routing domain object. 

Hence we can run server in memory and test our entire stack and therefore the only added benefit of functional testing is to test the translation between wire and domain.
 
We inject all of our dependencies to our Server so testing using fakes is easy peasy. We can even write simple fakes of external dependencies and spin them up in memory. 

#### To install:

npm install --save http4js

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

- add a type or interface for Filter, instead of referring to it as HttpHandler -> HttpHandler. 
Then you can add the "then" methods to it to recreate the chaining?
- support express backend
- other client verbs, PUT, PATCH, HEAD etc.
- write docs
- provide examples in this README

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
    let bodyString = `<h1>${req.method} to ${req.uri.href} with headers ${Object.keys(req.headers)}</h1>`;
    return new Promise(resolve => resolve(new Response(200, new Body(Buffer.from(bodyString)))));
};
 
let headerFilter = (handler: HttpHandler) => {
    return (req: Request) => {
        return handler(req.setHeader("filter", "1"));
    }
};
 
let moreRoutes = routes("/bob/{id}", "POST", (req) => {
    return new Promise(resolve => resolve(new Response(201, new Body("created a " + req.path))));
});
 
routes("/path", "GET", handler)
    .withHandler("/tom", "GET", handler)
    .withRoutes(moreRoutes)
    .withFilter(headerFilter)
    .asServer(3000).start();
 
let getRequest = new Request("GET", Uri.of("http://localhost:3000/path/tom")).setHeader("tom", "rules");
 
HttpClient(getRequest).then(response => {
    console.log(response.body.bodyString());
    console.log(response.headers);
});
```
