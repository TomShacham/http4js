# http4js

## hello world

```typescript
import {routes} from "./dist/main/core/RoutingHttpHandler";
import {Request} from "./dist/main/core/Request";
import {Response} from "./dist/main/core/Response";
import {HttpClient} from "./dist/main/core/Client";
 
routes("/", "GET", (req: Request) => {
  return new Promise(resolve => {
    resolve(new Response(200))
  })
})
    .asServer(3000)
    .start();
 
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


