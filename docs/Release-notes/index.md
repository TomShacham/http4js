# http4js

### Back to overview

- [Overview](/http4js/#basics)

# Release notes

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