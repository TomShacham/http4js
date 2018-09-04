# http4js

### Table of Contents

- [Overview](/http4js/#basics)
- [Handlers and Filters](/http4js/Handlers-and-filters/#handlers-and-filters)
- [Request and Response API](/http4js/Request-and-response-api/#request-and-response-api)
- [URI API](/http4js/Uri-api/#uri-api)
- [Routing API](/http4js/Routing-api/#routing-api)
- [In Memory Testing](/http4js/In-memory-testing/#in-memory-testing)
- [End to End Testing](/http4js/End-to-end-testing/#end-to-end-testing)
- [Approval testing with fakes](/http4js/Approval-testing-with-fakes/#approval-testing-with-fakes)
- [Zipkin tracing](/http4js/Zipkin-tracing/#zipkin-tracing)
- [Https Server](/http4js/Https-server/#https-server)
- [Proxy](/http4js/Proxy/#proxy)
- [Use in Javascript](/http4js/Use-in-javascript/#how-to-require-and-use-http4js-in-js)
- [Example App](https://github.com/TomShacham/http4js-eg)

# In Memory Testing

If we don't start the server then we can still use it to serve requests in memory:

```typescript
const routing = get("/path", async (req: Request) => ResOf(200))
    //.asServer()
    //.start()    
    
routing.serve(ReqOf("GET", "/path"))
     
// Response { headers: {}, body: '' , status: 200 }
```

This allows us to write unit tests that cover routing logic. 
Our test might look something like this:

```typescript
describe("unknown routes", () => {

    it("404 page if no routes match", async () => {
        const request = new Req("GET", "/unknown-route");
        const testApp = new TestApp();

        const response = await testApp.serve(request);

        equal(response.status, 404);
        equal(response.bodyString(), "Page not found");
    });

});
```

where our test app is just our app with fake dependencies passed in

```typescript
export class TestApp {
    routes: Routing;

    constructor(){
        const fakeDb = new FakeDb();
        const fakeSerice = new FakeService(fakeDb);
        this.routes = new App(fakeSerice).routes();
    }

    async serve(req: Req): Promise<Res> {
        return this.routes.serve(req);
    }
   
}
```

Prev: [Routing API](/http4js/Routing-api/#routing-api)

Next: [End to End Testing](/http4js/End-to-end-testing/#end-to-end-testing)

