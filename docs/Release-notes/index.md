# http4js

### Back to overview

- [Overview](/http4js/#basics)

# Release notes

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