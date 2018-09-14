# http4js

### Back to overview

- [Overview](/http4js/#basics)

# Release notes

### 4.2.0: Breaking change: Most precise handler no longer beats first declared match. Fix: Composed routes filter as expected.

To find a matching handler for a `Req`, we recurse **"left to right and deepest 
first"** through nested routes, ie. routes attached to top level routes 
using `withRoutes(routes)`, ending finally with the top level routes e.g.

```typescript
get('/', async()=> ResOf())
    .withRoutes(
        routes.withRoutes(furtherNestedRoutes)
    )
```

`furtherNestedRoutes` is traversed followed by `routes` then finally the top 
 level routes. 
 Further [docs here](https://tomshacham.github.io/http4js/Routing-api/#matching-handler-path)

### 4.1.3: Breaking change: Res Convenience methods for responding

`Redirect` is now a static method `Res.Redirect` as we provide a number of 
convenience methods eg. `Res.OK()` and `Res.GatewayTimeout`.

### 4.1.2: Convenience methods for starting server

We provide `HttpServer(3000)` and `HttpsServer(3000, certs)` as quick easy ways to provide a server.

### 4.1.1: Fix: HttpClient was not streaming out

See [streaming docs](https://tomshacham.github.io/http4js/Request-and-response-api/#streaming) for more info

### 4.1.0: streaming by default

`NativeHttpServer` and `HttpClient` stream in and out by default. A handle on 
the stream is provided by `req.bodyStream()` and a `res` is streamed out if
a `Res(200, readable)` is provided, i.e. a `Readable` stream body.

### 4.0.2: Move ssl-root-cas from prod code to test

We use `ssl-root-cas` to trust self-signed certs for testing `NativeHttpsServer`.
This has been moved from prod code to the test code. Needs releasing because
otherwise `ssl-root-cas` needs to be a dependency.

### 4.0.1: Handle on incoming `Req` stream

As we provide this handle via `req.bodyStream()`, accessing the `form` on an 
incoming `Req` is now done via `req.bodyForm()` in order to realise the stream. 
`req.bodyString()` will also realise it and work as expected. 

### 4.0.0: ! Breaking change: drop support for Koa and Express backends
  
In order to evolve the core library faster support for Express and Koa backends
has been dropped. Happy to add back later. 

### 3.2.2: bug fix: decodeURIComponent no longer called on response body.

### 3.2.0: Filters only apply per routing

combining routes using `withRoutes` no longer combines filters from each routing. 

### 3.1.0: New backend server: NativeHttpsServer. 

See [here](https://tomshacham.github.io/http4js/Https-server/#https-server) for more info

### 3.0.2: New client: HttpsClient.

### 3.0.0: **Breaking change**: routing paths are declared absolute, not relative. 


### Back to overview

- [Overview](/http4js/#basics)