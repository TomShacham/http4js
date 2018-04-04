### Table of Contents

- [Overview](/http4js)
- [Intro](/http4js/Intro)
- [In Memory Server](/http4js/In-memory)
- [Proxy](/http4js/Proxy)
- [Example App](https://github.com/TomShacham/http4js-eg)

# In Memory Server

If we don't start the server then we can still use it to serve requests in memory

```typescript
const routing = getTo("/path", "GET", (req: Request) => {
  return new Promise(resolve => {
    resolve(new Response(200))
  })
})
    //.asServer(3000)
    //.start()    
```

Then we can make an in memory call to this endpoint

```typescript
routing.match(new Request("GET", "/path"))
     
// Response { headers: {}, body: Body { bytes: '' }, status: 200 }

```
