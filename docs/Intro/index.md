### Table of Contents

- [Overview](/http4js)
- [Intro](/http4js/Intro)
- [In Memory Server](/http4js/In-memory)

# Intro

## Basic Server

We can route a path to a handler and start it as a server:

```typescript
routes("/path", "GET", (req: Request) => {
  return new Promise(resolve => {
    resolve(new Response(200))
  })
})
    .asServer(3000)
    .start();
```

Then we can make a client call to this endpoint

```typescript
HttpClient(new Request("GET", "http://localhost:3000/path"))
    .then(response => console.log(response));
     
/*
Response {
  headers: 
   { date: 'Sun, 25 Mar 2018 09:24:43 GMT',
     connection: 'close',
     'transfer-encoding': 'chunked' },
  body: Body { bytes: <Buffer > },
  status: 200 }
*/
```

We provide convenience methods for routing

```typescript
getTo("/path", (req: Request) => {
  return new Promise(resolve => {
    resolve(new Response(200))
  })
})
 
postTo("/path", (req: Request) => {
  return new Promise(resolve => {
    resolve(new Response(200))
  })
})
```
