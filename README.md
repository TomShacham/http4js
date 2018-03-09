## Http4js

A port of [http4k](https://github.com/http4k/http4k): a lightweight _toolkit_ to allow in memory functional testing and to simplify working with HTTP. 

#### To run: 

`tsc index.ts --target es5; node index.js`

#### To test:

```
npm install --save 
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

#### Example

```
let handler = (req: Request) => {
    let bodyString = `<h1>${req.method} to ${req.uri.href} with headers ${Object.keys(req.headers)}</h1>`;
    return new Response(200, new Body(Buffer.from(bodyString)))
};

let headerFilter = (handler: HttpHandler) => {
    return (req: Request) => {
        return handler(req.setHeader("filter", "1"));
    }
};

let moreRoutes = routes("/bob/{id}", "POST", (req) => {
    return new Response(201, new Body("created a " + req.path))
});

routes("/path", "GET", handler)
    .withHandler("/tom", "GET", handler)
    .withRoutes(moreRoutes)
    .withFilter(headerFilter)
    .asServer(3000).start();

let getRequest = new Request("GET", Uri.of("http://localhost:3000/path/tom")).setHeader("tom", "rules");
let postRequest = new Request("GET", Uri.of("http://localhost:3000/path/tom")).setHeader("tom", "rules");

let client = HttpClient;

client(getRequest).then(succ => {
    console.log("body string");
    console.log(succ.body.bodyString());
    console.log("headers");
    console.log(succ.headers);
});

client(postRequest).then(succ => {
    console.log("body string");
    console.log(succ.body.bodyString());
    console.log("headers");
    console.log(succ.headers);
});
```
