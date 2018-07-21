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
- [Express or Koa Backend](/http4js/Express-or-koa-backend/#express-or-koa-backend)
- [Https Server](/http4js/Https-server/#https-server)
- [Proxy](/http4js/Proxy/#proxy)
- [Use in Javascript](/http4js/Use-in-javascript/#how-to-require-and-use-http4js-in-js)
- [Example App](https://github.com/TomShacham/http4js-eg)

# Uri API

Handy for manipulating a URI. You might want to update just the protocol or 
get the hostname or port from a URI.
 
```typescript
const uri = Uri.of("http://localhost:3000/my/cool/path?tosh=rocks&bosh=pwnage&losh=awsm")
uri.hostname();    // localhost
uri.protocol();    // http
uri.port();        // 3000
uri.queryString(); // tosh=rocks&bosh=pwnage&losh=awsm
```

And we have methods to give us a new Uri with any of the above changed:

```typescript
const uri = Uri.of("http://localhost:3000/my/cool/path?tosh=rocks&bosh=pwnage")
uri.withHostname("google").asUriString();    
// http://google:3000/my/cool/path?tosh=rocks&bosh=pwnage 

uri.withProtocol("https").asUriString();   
// https://localhost:3000/my/cool/path?tosh=rocks&bosh=pwnage

uri.withPort(1234);  
// http://localhost:1234/my/cool/path?tosh=rocks&bosh=pwnage

uri.withQuery("losh", "awsm").asUriString(); 
// http://localhost:3000/my/cool/path?tosh=rocks&bosh=pwnage&losh=awsm

uri.withAuth("ben", "ben-password").asUriString();
// http://ben:ben-password@localhost:3000/my/cool/path?tosh=rocks&bosh=pwnage

```

The full API is as follows

```typescript
static of(uri: string): Uri 

asUriString(): string 

protocol(): string 

withProtocol(protocol: string): Uri 

queryString(): string 

withQuery(name: string, value: string): Uri 

path(): string

withPath(path: string): Uri 

hostname(): string 

withHostname(hostname: string): Uri 

port(): string 

withPort(port: number): Uri 

auth(): string 

withAuth(username: string, password: string): Uri 

```

Prev: [Request and Response API](/http4js/Request-and-response-api/#request-and-response-api)

Next: [Routing API](/http4js/Routing-api/#routing-api)
