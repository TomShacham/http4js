# http4js-clients

This module includes a Zipkin tracing. 

## Adding to your project

```bash
npm i --save http4js-zipkin
```

## Example usage

For more information, read the full [docs](https://tomshacham.github.io/http4js/Zipkin-tracing/#zipkin-tracing).

```typescript
get('/', async(req) => ResOf(200, JSON.stringify(req.headers)))
    .withFilter(Filters.ZIPKIN)
    .withFilter(Filters.TIMING)
```