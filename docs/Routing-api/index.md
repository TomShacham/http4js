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
- [Zipkin tracing](/http4js/Zipkin-tracing/#zipkin-tracing)
- [Https Server](/http4js/Https-server/#https-server)
- [Proxy](/http4js/Proxy/#proxy)
- [Use in Javascript](/http4js/Use-in-javascript/#how-to-require-and-use-http4js-in-js)
- [Example App](https://github.com/TomShacham/http4js-eg)

# Routing API

A basic bit of routing might look like this:

```typescript
get("/", async () => ResOf(200, "Home page"))
    .withGet("/about", async () => ResOf(200, "About us."));
```

We can declare routing separately and combine at a later stage:

```typescript
// root stays the same 
const houseKeeping = get("/", async () => ResOf(200, "Root"))
    .withGet("/about", async () => ResOf(200, "About us."));

// some other routes whose root is /hotels/{name}
const hotelRoutes = get("/hotels/{name}", async (req) => {
    return ResOf(200, hotels[req.pathParams.name]);
}).withGet("/hotels/{name}/properties/{property}", async (req) => {
    const body = hotels[req.pathParams.name].properties[req.pathParams.property];
    return ResOf(200, body); 
})

// combine them
houseKeeping.withRoutes(hotelRoutes)
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

## Matching handler path

Routes are matched **left to right and deepest first**. Declaring separate groups 
of routes and then combining them later helps make your code modular 
and more clearly testable. Eg. we might declare a few groups like so:

```typescript
const houseKeeping =  get("/home", async () => {
    return ResOf(200, "home page");
}).withGet("/about", async () => {
    return ResOf(200, "about us");
});

const userSignUp = get("/register", async () => {
   return ResOf(200, "register");
}).withPost("/register", async (req: Req) => {
    const {username, password} = req.bodyForm();
    const saved = await userService.register(username, password);
    return ResOf(saved ? 200 : 400, saved ? "Welcome!" : "Try again.");
});

const combinedRoutes = houseKeeping
    .withRoutes(userSignUp)
```

In the above case, `userSignUp` routes will be recursed through first. 

The general case, "left to right and deepest first" looks like: 

```text
        __A__
       /  \  \
      B    D  G
     /      \  
    C        E
              \
               F
```

Which we achieve by writing 

```typescript
A.withRoutes(
    B.withRoutes(C)
).withRoutes(
    D.withRoutes(
        E.withRoutes(F)
    )
).withRoutes(G)
```

And the result would be that we match on `C` then `B` then `F` then 
`E` then `D` then `G` then `A`

## Matching on a header

We can pass a header to a route and it will only match `Req`s made with that header.

```typescript
const requestAcceptText = ReqOf("GET", "/tom").withHeader(Headers.ACCEPT, HeaderValues.APPLICATION_JSON);

await route(requestAcceptText, async() => ResOf(200, "Accepted text"))
    .serve(requestAcceptText)

```

## Filters passed through

Top level filters apply to all routes. But only those filters within a group
of routes and only as deep as the matched handler will be applied.
E.g. matching handler `E` in the following will only apply filters 
attached to `E`, `D` and `A`.

```text
        __A__
       /  \  \
      B    D  G
     /      \  
    C        E
              \
               F
```

## Symmetry of routing and serving

We can also declare a route using a Req object: 

```typescript
const requestAcceptText = ReqOf("GET", "/tom").withHeader(Headers.ACCEPT, HeaderValues.APPLICATION_JSON);
const requestAcceptJson = ReqOf("GET", "/tom").withHeader(Headers.ACCEPT, HeaderValues.TEXT_HTML);

const response = await route(ReqOf("GET", "/"), async() => ResOf(200, "Hiyur"))
    .withRoute(requestAcceptText, async() => ResOf(200, "Hiyur text")) //will match this route based on header
    .withRoute(requestAcceptJson, async() => ResOf(200, "Hiyur json"))
    .serve(requestAcceptText);  //serve with same request used to declare routing
```

## Path params

We've seen above how to specify path params:

```typescript
get("/hotels/{name}/property/{property}", async (req) => {
  return ResOf(200, req.pathParams)
}).serve(
  ReqOf(Method.GET, "http://localhost:3000/hotels/Tom-Hotel/property/Cola-Beach")
);

//pathParams: { name: 'Tom-Hotel', property: 'Cola-Beach' }
```

## Query params

Query params are available in a similar way.

```typescript
get("/hotels", async (req) => {
  const nameQuery = req.queries['name'];
  const filteredHotels = hotels.filter(hotel => hotel.name === nameQuery);
  return ResOf(200, filteredHotels);
}).serve(
  ReqOf(Method.GET, "http://localhost:3000/hotels").withQuery("name", "Tom Hotel")
);
```

## Form params

And form params are available in a similar way too.

```typescript
post("/hotels", async (req) => {
  const hotelName = req.bodyForm()['name'];
  return ResOf(200, hotelName);
}).serve(
  ReqOf(Method.POST, "http://localhost:3000/hotels").withFormField("name", "Tom Hotel")
);
```

We need to call `bodyForm()` because by default, our `Req` has a `Readable`
stream as its body, and therefore we cannot get at the `form` without reading
the stream into memory. 

## Convenience methods

We have `withGet`, `withPost`, etc...

For terseness we can rewrite:

```typescript
return get("/", async () => {
    return ResOf(200, "root");
}).withHandler("GET", "/family/{name}", async () => { //withHandler
    return ResOf(200, "least precise");
})
```

as the following

```typescript
return get("/", async () => {
    return ResOf(200, "root");
}).withGet("/family/{name}", async () => { //withGet
    return ResOf(200, "least precise");
})
```

## List of routes

We give you back the routes you've listed, in case you want to describe your API

```typescript
get("/", async() => ResOf())
    .withRoute(ReqOf("POST", "/tosh", "", {[Headers.CONTENT_TYPE]: HeaderValues.APPLICATION_JSON}),
        async() => ResOf())
    .withPut("/putsch", async() => ResOf())
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
                    headers: HeadersType = {},
                    handler: HttpHandler)

    withRoutes(routes: Routing): Routing 

    withRoute(request: Req, handler: HttpHandler): Routing 

    withFilter(filter: Filter): Routing 

    withHandler(method: string, path: string, handler: HttpHandler, headers: HeadersType = {}): Routing

    asServer(server: Http4jsServer = HttpServer(3000)): Http4jsServer

    serve(request: Req): Promise<Res> 

    match(request: Req): MountedHttpHandler 

    withGet(path: string, handler: HttpHandler): Routing 

    withPost(path: string, handler: HttpHandler): Routing

    withPut(path: string, handler: HttpHandler): Routing 

    withPatch(path: string, handler: HttpHandler): Routing 

    withDelete(path: string, handler: HttpHandler): Routing 

    withOptions(path: string, handler: HttpHandler): Routing 

    withHead(path: string, handler: HttpHandler): Routing
}

routes(method: string, path: string, handler: HttpHandler, headers: HeadersType = {}): Routing

route(request: Req, handler: HttpHandler): Routing

get(path: string, handler: HttpHandler, headers: HeadersType = {}): Routing

post(path: string, handler: HttpHandler, headers: HeadersType = {}): Routing

put(path: string, handler: HttpHandler, headers: HeadersType = {}): Routing

patch(path: string, handler: HttpHandler, headers: HeadersType = {}): Routing

options(path: string, handler: HttpHandler, headers: HeadersType = {}): Routing

head(path: string, handler: HttpHandler, headers: HeadersType = {}): Routing
```

Prev: [URI API](/http4js/Uri-api/#uri-api)

Next: [In Memory Testing](/http4js/In-memory-testing/#in-memory-testing)
