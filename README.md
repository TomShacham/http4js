# http4js

A lightweight HTTP framework for Typescript / JS, with zero dependencies

## *** [read the docs](https://tomshacham.github.io/http4js/) ***

## Using in your project

### To install:

```
npm install --save http4js
#or
yarn add http4js
```


## Example

An example server and client

```typescript

//define our routes
const routing = routes('GET', ".*", async (req: Req) => {
    console.log(req);
    return ResOf(Status.OK, 'OK');
})

//add csrf token header to every request and vary gzip to every response
const headerFilter = (handler: HttpHandler) => {
    return async (req: Req) => {
        const response = await handler(req.withHeader(Headers.X_CSRF_TOKEN, Math.random()))
        return response.withHeader(Headers.VARY, "gzip");
    }
};

routing
    .withFilter(headerFilter)
    .asServer() // starts on port 3000 by default
    .start();

//make an http request to our server and log the response
HttpClient(ReqOf(Method.GET, "http://localhost:3000/any/path"))

// output
Req {
  headers: 
   { host: 'localhost:3000',
     connection: 'close',
     'content-type': 'application/x-www-form-urlencoded',
     'x-csrf-token': 0.8369821184747923 },
  queries: {},
  pathParams: {},
  form: {},
  method: 'GET',
  uri: 
   Uri {
     matches: {},
     asNativeNodeRequest: 
      Url {
        protocol: 'http:',
        slashes: true,
        auth: null,
        host: 'localhost:3000',
        port: '3000',
        hostname: 'localhost',
        hash: null,
        search: null,
        query: null,
        pathname: '/any/path',
        path: '/any/path',
        href: 'http://localhost:3000/any/path' } },
  body: '' }


```

## Contributing

I'd be very happy if you'd like to contribute :)

### To run:

```
git clone git@github.com:TomShacham/http4js.git && \ 
cd http4js && \
yarn && \
yarn build && \
yarn test
```

## History and Design

http4js is a port of [http4k](https://github.com/http4k/http4k).

The concept is called Server as a Function (SaaF).

Early ideas and influence from [Daniel Bodart](https://github.com/bodar)'s [Utterly Idle](https://github.com/bodar/utterlyidle)

## To dos

- zipkin tracing
  - build collector
  - generate bytes not a math random string
  - support sampled and debug
  - docs
- possibly have a Headers class for dicing with headers, not just an object
- get rid of pivoted routing
- streaming
- apply filters to some routes and not all
- native https server