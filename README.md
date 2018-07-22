# http4js

A lightweight HTTP framework for Typescript / JS, with zero dependencies

### Latest release notes

[Full notes here](https://tomshacham.github.io/http4js/Release-notes/#release-notes)

### 3.2.0: Filters only apply per routing

combining routes using `withRoutes` no longer combines filters from each routing. 

### 3.1.0: New backend server: NativeHttpsServer. 

See [here](https://tomshacham.github.io/http4js/Https-server/#https-server) for more info

### 3.0.2: New client: HttpsClient.

### 3.0.0: *Breaking change*: routing paths are declared absolute, not relative. 


### *** [read the docs](https://tomshacham.github.io/http4js/) ***

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

- reversible routing
- zipkin tracing
  - build collector
  - generate bytes not a math random string
  - support sampled and debug
  - docs
  - pull out into a module
- streaming

## Running HTTPS Server tests

Follow these [Instructions](https://stackoverflow.com/questions/19665863/how-do-i-use-a-self-signed-certificate-for-a-https-node-js-server)
to create your own certificates in order to run an HTTPS server locally.

Then run 

```bash
yarn test-ssl
```


[Commands](https://github.com/Daplie/nodejs-self-signed-certificate-example/blob/master/make-root-ca-and-certificates.sh)

I followed slightly differently in http4js: 

```bash
cd src/test/ssl

# create your own CA key
openssl genrsa \
  -out my-root-ca.key.pem \
  2048

# Create your own CA cert using CA key
# Self-sign your Root Certificate Authority
# Since this is private, the details can be as bogus as you like
openssl req \
  -x509 \
  -new \
  -nodes \
  -key my-root-ca.key.pem \
  -days 1024 \
  -out my-root-ca.cert.pem \
  -subj "/C=US/ST=Utah/L=Provo/O=ACME Signing Authority Inc/CN=example.com"

# Create a private key
# Create a Device Certificate for each domain,
# such as example.com, *.example.com, awesome.example.com
# NOTE: You MUST match CN to the domain name or ip address you want to use
openssl genrsa \
  -out key.pem \
  2048


# Make a Certificate Signing Request (csr) to then create a CA signed cert below
# Create a request from your Device, which your Root CA will sign
openssl req -new \
  -key key.pem \
  -out csr.pem \
  -subj "/C=US/ST=Utah/L=Provo/O=ACME Tech Inc/CN=localhost"

# Create CA signed cert
# Sign the request from Device with your Root CA
# -CAserial my-root-ca.srl
openssl x509 \
  -req -in csr.pem \
  -CA my-root-ca.cert.pem \
  -CAkey my-root-ca.key.pem \
  -CAcreateserial \
  -out cert.pem \
  -days 500

# Create fullchain, your new cert followed by CA cert
cat cert.pem my-root-ca.cert.pem > fullchain.pem
```
