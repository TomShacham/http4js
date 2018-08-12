# http4js-clients

This module includes an `HttpClient` and an `HttpsClient`.

## Adding to your project

```bash
npm i --save http4js-clients
```

## Example usage

For more information, read the full [docs](https://tomshacham.github.io/http4js).

```typescript
const response = await HttpClient(ReqOf('GET', 'http://localhost:3000/'));
response.bodyString();
// hello, world!
```