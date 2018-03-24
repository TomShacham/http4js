# http4js

## hello world

```typescript
routes("/", "GET", (req: Request) => {
  return new Promise(resolve => {
    resolve(new Response(200))
  })
}).asServer(3000);
```
