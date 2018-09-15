# http4js

A lightweight HTTP framework for Typescript / JS, with zero dependencies

# >> [read the docs :)](https://tomshacham.github.io/http4js/) <<

## Use http4js in your project

```
npm install --save http4js
```

## Contents 

- [Example](https://github.com/tomshacham/http4js#example)
- [Latest features](https://github.com/tomshacham/http4js#latest-features)
- [Contributing](https://github.com/tomshacham/http4js#contributing)
- [History and Design](https://github.com/tomshacham/http4js#history-and-design)
- [To dos](https://github.com/tomshacham/http4js#to-dos)
- [Running HTTPS Server tests](https://github.com/tomshacham/http4js#running-https-server-tests)
- [Sanity Testing Streaming](https://github.com/tomshacham/http4js#sanity-testing-streaming)

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

// start routing as a NativeHttpServer on port 3000
routing
    .withFilter(headerFilter)
    .asServer(HttpServer(3000))
    .start();

// make an http request to our server and log the response
HttpClient(ReqOf(Method.GET, "http://localhost:3000/any/path"))
```

## Latest features

[Full Release Notes here](https://tomshacham.github.io/http4js/Release-notes/#release-notes)

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

### 4.0.0: ! Breaking change: drop support for Koa and Express backends
  
In order to evolve the core library faster support for Express and Koa backends
has been dropped. Happy to add back later.

## Contributing

I'd be very happy if you'd like to contribute :)

### To run:

```
git clone git@github.com:TomShacham/http4js.git && \ 
cd http4js && \
npm i --save && \
./create-ssl-certs.sh && \
npm test
```

## History and Design

http4js is a port of [http4k](https://github.com/http4k/http4k).

Early ideas and influence from [Daniel Bodart](https://github.com/bodar)'s [Utterly Idle](https://github.com/bodar/utterlyidle)


## To dos

- generalise routing to an interface 
  - use totallylazy to implement new types of routing
- reversible routing
  - named functions will have route named as such
- client side httpclient (from stu)
- example app
    - withOptions on withPost
  
## Running HTTPS Server tests

We need our own certs to run an HTTPS server locally.

These [Commands](https://github.com/Daplie/nodejs-self-signed-certificate-example/blob/master/make-root-ca-and-certificates.sh) 
get you most of the way, I altered them slightly for this script, that may work for you 

```bash
./create-ssl-certs.sh
```

If not, follow these [Instructions](https://stackoverflow.com/questions/19665863/how-do-i-use-a-self-signed-certificate-for-a-https-node-js-server)
to create your own certificates in order to run an HTTPS server locally.

Then run 

```bash
npm test
```

## Sanity Testing Streaming

Create a big file 

```bash
cat /dev/urandom | base64 >> bigfile.txt
# wait ...
# ^C
```

Start up a server and stream the file 

```typescript
get('/bigfile', async() => ResOf(200, fs.createReadStream('./bigfile.txt')))
    .asServer()
    .start();
```

Check the memory of usage of the process. 
- If we are **not** streaming, then the whole
file will be read into memory before the server responds, using lots of memory. 
- If we **are** streaming then the memory usage should be much lower. 
