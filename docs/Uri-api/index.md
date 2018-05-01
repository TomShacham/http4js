# http4js

### Table of Contents

- [Overview](/http4js/#basics)
- [Intro](/http4js/Intro/#intro)
- [Handlers and Filters](/http4js/Handlers-and-filters/#handlers-and-filters)
- [Request and Response API](/http4js/Request-and-response-api/#request-and-response-api)
- [URI API](/http4js/Uri-api/#uri-api)
- [In Memory Testing](/http4js/In-memory-testing/#in-memory-testing)
- [Approval testing with fakes](/http4js/Approval-testing-with-fakes/#approval-testing-with-fakes)
- [Express or Koa Backend](/http4js/Express-or-koa-backend/#express-or-koa-backend)
- [Proxy](/http4js/Proxy/#proxy)
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
uri.auth();        // tom:password
```

And we have methods to give us a new Uri with any of the above changed:

```typescript
const uri = Uri.of("http://localhost:3000/my/cool/path?tosh=rocks&bosh=pwnage")
uri.withHostname("google").asUriString();    
// http://tom:password@google:3000/my/cool/path?tosh=rocks&bosh=pwnage 

uri.withProtocol("https").asUriString();   
// https://tom:password@localhost:3000/my/cool/path?tosh=rocks&bosh=pwnage

uri.withPort(1234);  
// http://tom:password@localhost:1234/my/cool/path?tosh=rocks&bosh=pwnage

uri.withQuery("losh", "awsm").asUriString(); 
// http://tom:password@localhost:3000/my/cool/path?tosh=rocks&bosh=pwnage&losh=awsm

uri.withAuth("ben", "ben-password").asUriString();
// http://ben:ben-password@localhost:3000/my/cool/path?tosh=rocks&bosh=pwnage

```
