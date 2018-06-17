# http4js

### Table of Contents

- [Overview](/http4js/#basics)
- [Handlers and Filters](/http4js/Handlers-and-filters/#handlers-and-filters)
- [Request and Response API](/http4js/Request-and-response-api/#request-and-response-api)
- [URI API](/http4js/Uri-api/#uri-api)
- [Routing API](/http4js/Routing-api/#routing-api)
- [In Memory Testing](/http4js/In-memory-testing/#in-memory-testing)
- [Approval testing with fakes](/http4js/Approval-testing-with-fakes/#approval-testing-with-fakes)
- [Express or Koa Backend](/http4js/Express-or-koa-backend/#express-or-koa-backend)
- [Proxy](/http4js/Proxy/#proxy)
- [Use in Javascript](/http4js/Use-in-javascript/#how-to-require-and-use-http4js-in-js)
- [Example App](https://github.com/TomShacham/http4js-eg)

# Routing API

Routing is declared from a root. We start with something basic and add to it:

```typescript
get("/", async () => Res(200, "Root"))
    .withHandler(Method.GET, "/about", async () => Res(200, "About us."));
```

If we want to nest our handlers we can combine them at a later time:

```typescript
// root stays the same 
const root = get("/", async () => Res(200, "Root"))
    .withHandler(Method.GET, "/about", async () => Res(200, "About us."));

// some other routes whose root is /hotels/{name}
const nestedRoutes = get("/hotels/{name}", async (req) => {
    return Res(200, hotels[req.pathParams.name]);
}).withHandler(Method.GET, "/properties/{property}", async (req) => {
    // now we have a handler on /hotels/{name}/properties/{property} and can see both path params
    const body = hotels[req.pathParams.name].properties[req.pathParams.property];
    return Res(200, body); 
})

// combine them
root.withRoutes(nestedRoutes)
    .asServer()
    .start();

// some data
const hotels = {
    "tom-hotel": {
       name: "Tom Hotel", numberOfProperties: 2, properties: {
           "Cola Beach": {name: "Cola Beach", size: 20, location: "London"},
           "Lilt Lookover": {name: "Lilt Lookover", size: 20, location: "New York"}
       }
    }
}
```

The most specific handler is matched first:

```typescript
return get("/", async () => {
    return Res(200, "root");
}).withHandler("GET", "/family/{name}", async () => {
    return Res(200, "least precise");
}).withHandler("GET", "/family/{name}/then/more", async () => {
    return Res(200, "most precise");
}).withHandler("POST", "/family/{name}/less", async () => {
    return Res(200, "medium precise");
})
    .serve(new Request("GET", "/family/shacham/then/more"))
    .then(response => equal(response.bodyString(), "most precise"))
```

so despite the handler at `/family/{name}/then/more` being declared after the more
generic handler at `/family/{name}` it is matched first.

## Symmetry of routing and serving

We can also declare a route using a Req object: 

```typescript
const requestAcceptText = Req("GET", "/tom").withHeader(Headers.ACCEPT, HeaderValues.APPLICATION_JSON);
const requestAcceptJson = Req("GET", "/tom").withHeader(Headers.ACCEPT, HeaderValues.TEXT_HTML);

const response = await route(Req("GET", "/"), async() => Res(200, "Hiyur"))
    .withRoute(requestAcceptText, async() => Res(200, "Hiyur text")) //will match this route based on header
    .withRoute(requestAcceptJson, async() => Res(200, "Hiyur json"))
    .serve(requestAcceptText);  //serve with same request used to declare routing
```

## Path params

We've seen above how to specify path params:

```typescript
get("/hotels/{name}/property/{property}", async (req) => {
  return Res(200, req.pathParams)
}).serve(
  Req(Method.GET, "http://localhost:3000/hotels/Tom-Hotel/property/Cola-Beach")
);

//pathParams: { name: 'Tom-Hotel', property: 'Cola-Beach' }
```

## Query params

Query params are available in a similar way.

```typescript
get("/hotels", async (req) => {
  const nameQuery = req.queries['name'];
  const filteredHotels = hotels.filter(hotel => hotel.name === nameQuery);
  return Res(200, filteredHotels);
}).serve(
  Req(Method.GET, "http://localhost:3000/hotels").withQuery("name", "Tom Hotel")
);
```

## Form params

And form params are available in a similar way too


```typescript
post("/hotels", async (req) => {
  const hotelName = req.form['name'];
  return Res(200, hotelName);
}).serve(
  Req(Method.POST, "http://localhost:3000/hotels").withFormField("name", "Tom Hotel")
);
```

## Convenience methods

We have `withGet`, `withPost`, etc...

For terseness we can rewrite:

```typescript
return get("/", async () => {
    return Res(200, "root");
}).withHandler("GET", "/family/{name}", async () => { //withHandler
    return Res(200, "least precise");
})
```

as the following

```typescript
return get("/", async () => {
    return Res(200, "root");
}).withGet("/family/{name}", async () => { //withGet
    return Res(200, "least precise");
})
```

## List of routes

We give you back the routes you've listed, in case you want to describe your API

```typescript
get("/", async() => Res())
    .withRoute(Req("POST", "/tosh", "", {[Headers.CONTENT_TYPE]: HeaderValues.APPLICATION_JSON}),
        async() => Res())
    .withPut("/putsch", async() => Res())
    .routes()
```

will return you 

```typescript
[
    {method: "GET", path: "/", headers: {}},
    {method: "POST", path: "/tosh", headers: {"Content-Type": "application/json"}},
    {method: "PUT", path: "/putsch", headers: {}},
]
```

The full API is as follows: 

```typescript
class Routing {
    server: Http4jsServer;
    
    constructor(method: string,
                    path: string,
                    headers: KeyValues = {},
                    handler: HttpHandler)

    withRoutes(routes: Routing): Routing 

    withRoute(request: Request, handler: HttpHandler): Routing 

    withFilter(filter: Filter): Routing 

    withHandler(method: string, path: string, handler: HttpHandler, headers: KeyValues = {}): Routing

    asServer(server: Http4jsServer = new NativeServer(3000)): Http4jsServer

    serve(request: Request): Promise<Response> 

    match(request: Request): MountedHttpHandler 

    withGet(path: string, handler: HttpHandler): Routing 

    withPost(path: string, handler: HttpHandler): Routing

    withPut(path: string, handler: HttpHandler): Routing 

    withPatch(path: string, handler: HttpHandler): Routing 

    withDelete(path: string, handler: HttpHandler): Routing 

    withOptions(path: string, handler: HttpHandler): Routing 

    withHead(path: string, handler: HttpHandler): Routing
}

routes(method: string, path: string, handler: HttpHandler, headers: KeyValues = {}): Routing

route(request: Request, handler: HttpHandler): Routing

get(path: string, handler: HttpHandler, headers: KeyValues = {}): Routing

post(path: string, handler: HttpHandler, headers: KeyValues = {}): Routing

put(path: string, handler: HttpHandler, headers: KeyValues = {}): Routing

patch(path: string, handler: HttpHandler, headers: KeyValues = {}): Routing

options(path: string, handler: HttpHandler, headers: KeyValues = {}): Routing

head(path: string, handler: HttpHandler, headers: KeyValues = {}): Routing
```

Prev: [URI API](/http4js/Uri-api/#uri-api)

Next: [In Memory Testing](/http4js/In-memory-testing/#in-memory-testing)
