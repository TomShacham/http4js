# http4js-core

This module provides the core logic for routing and serving requests and responses.

## Adding to your project

```bash
npm i --save http4js-core
```

## Example usage

For more information, read the full [docs](https://tomshacham.github.io/http4js).

```typescript
get('/', async(req: Req) => ResOf(200, req.headers))
    .asServer(new NativeHttpServer(3000))
    .start()
```