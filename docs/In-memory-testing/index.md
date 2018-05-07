# http4js

### Table of Contents

- [Overview](/http4js/#basics)
- [Intro](/http4js/Intro/#intro)
- [Handlers and Filters](/http4js/Handlers-and-filters/#handlers-and-filters)
- [Request and Response API](/http4js/Request-and-response-api/#request-and-response-api)
- [URI API](/http4js/Uri-api/#uri-api)
- [In Memory Testing](/http4js/In-memory-testing/#in-memory-testing)
- [Approval testing with fakes](/http4js/Approval-testing-with-fakes/#approval-testing-with-fakes)
- [Express or Koa Backend](/http4js/Express-or-koa-backend/#express-or-koa-backend)
- [Proxy](/http4js/Proxy/#proxy)
- [Example App](https://github.com/TomShacham/http4js-eg)

# In Memory Testing

If we don't start the server then we can still use it to serve requests in memory:

```typescript
const routing = get("/path", (req: Request) => Promise.resolve(new Response(200)))
    //.asServer()
    //.start()    
    
routing.serve(new Request("GET", "/path"))
     
// Response { headers: {}, body: Body { bytes: '' }, status: 200 }
```

This allows us to write unit tests that cover routing logic. 
Our test might look something like this:

```typescript
describe("unknown routes", () => {

    it("404 page if no routes match", async () => {
        let request = new Request("GET", "/unknown-route");
        let testApp = new TestApp();

        const response = await testApp.serve(request);

        equal(response.status, 404);
        equal(response.bodyString(), "Page not found");
    });

});
```

where our test app is just our app with fake dependencies passed in

```typescript
export class TestApp {
    routes: RoutingHttpHandler;

    constructor(){
        const fakeDb = new FakeDb();
        const fakeSerice = new FakeService(fakeDb);
        this.routes = new App(fakeSerice).routes();
    }

    async serve(req: Request): Promise<Response> {
        return this.routes.serve(req);
    }
   
}
```
