# http4js

A lightweight HTTP framework for Typescript / JS, with zero dependencies

### *** [read the docs](https://tomshacham.github.io/http4js/) ***

## Latest release notes

[Full notes here](https://tomshacham.github.io/http4js/Release-notes/#release-notes)

### 3.2.0: Filters only apply per routing

combining routes using `withRoutes` no longer combines filters from each routing. 

### 3.1.0: New backend server: NativeHttpsServer. 

See [here](https://tomshacham.github.io/http4js/Https-server/#https-server) for more info

### 3.0.2: New client: HttpsClient.

### 3.0.0: **Breaking change**: routing paths are declared absolute, not relative. 


## Use http4js in your project

### To install:

```
npm install --save http4js
```

or

```
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
        ...,
        protocol: 'http:',
        host: 'localhost:3000',
        port: '3000',
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

- monorepo: breakout zipkin & httpclients to module (probably have in both core and separate module 'http4js-client')
- update example app
- chain withHeaders calls on an http client
- client side httpclient (from stu)
- streaming
- add convenience responses like ok() and badRequest()
- generalise routing to an interface, use totallylazy to implement new types of routing
- reversible routing
  - what happens if names conflict?
  - what if multiple handlers match by path
  
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
yarn test-ssl
```
