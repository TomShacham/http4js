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

//define our server routes and start on port 3000
//GET to any path returns `GET to {PATH} with req headers {HEADERS}`
const routing = routes(Method.GET, ".*", async (req: Request) => {
    const html = `<h1>${req.method} to ${req.uri.path()} with req headers ${Object.keys(req.headers)}</h1>`;
    return ResOf(Status.OK, html);
})

//add csrf token header to every request and vary gzip to every response
const headerFilter = (handler: HttpHandler) => {
    return async (req: Request) => {
        const response = await handler(req.withHeader(Headers.X_CSRF_TOKEN, Math.random()))
        return response.withHeader(Headers.VARY, "gzip");
    }
};

routing.withFilter(headerFilter)
    .asServer()
    .start();

//make an http request to our server and log the response
const response = await HttpClient(Req(Method.GET, "http://localhost:3000/any/path"))
console.log(response);
console.log(response.bodyString());


Res

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
