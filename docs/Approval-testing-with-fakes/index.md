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
- [Use in Javascript](/http4js/Use-in-javascript/#how-to-require-and-use-http4js-in-js)
- [Example App](https://github.com/TomShacham/http4js-eg)

# Approval testing with fakes

Since testing our routing is so easy and starting servers is also easy, 
we can write end to end tests and even system tests using fakes. 
And with approval testing we can test that what we intend to render is
entirely correct in one fell swoop. 

In the [Example App](https://github.com/TomShacham/http4js-eg), we have a
bunch of friends and we store some of their details. Here is an approval
test that makes sure we can view a friend one at a time.

```typescript
    it("shows one friend at a time", async () => {
        let testApp = new TestApp();
        await testApp.serve(new Request("POST", "/friends").setForm({name: "Tosh"}));
        await testApp.approve("one friend",
            new Request("GET", "/friends/Tosh"))
    });
```

The `approve` method on our `testApp` is simple. It serves the request
in memory which gives us our `actual` result. It then looks for an "approved"
file in `./src/test/resources` named `testFileName` which we pass in. We
then compare the `actual` result with the `approved` result, with some
error handling for when the `approved` file doesn't exist or if the `approved`
and `actual` are different but we want to accept the `actual` result, so we
give a command to copy the actual over the `approved`.  

```typescript
async approve(testFileName: string, req: Request) {
    const actual1 = await this.routes.match(req);
    const actual = actual1.bodyString();
    const actualfilePath = `./src/test/resources/${testFileName}.actual`;
    fs.writeFileSync(actualfilePath, actual, "utf8");
    const approvalfilePath = `./src/test/resources/${testFileName}.approved`;
    try {
        const expected = fs.readFileSync(approvalfilePath, "utf8");
        equal(actual, expected);
    } catch (e) {
        if (e.message.includes("no such file or directory")) {
            console.log("*** Create file from actual ***");
            console.log(`cp "${actualfilePath}" "${approvalfilePath}"`);
        } else {
            console.log("*** To approve  ***");
            console.log(`cp "${actualfilePath}" "${approvalfilePath}"`);
        }
        throw e;
    }
}
```

So again, looking at our test:

```typescript
    it("shows one friend at a time", async () => {
        let testApp = new TestApp();
        //setup
        await testApp.serve(new Request("POST", "/friends").setForm({name: "Tosh"}));
        //approve
        await testApp.approve("one friend",
            new Request("GET", "/friends/Tosh"))
    });
```

First we setup some data - we post a new friend to our app thereby saving
`"Tosh"` in our database. We then approve that the result of a `GET` to
`"/friends/Tosh` is what is in our `approved` file named `"one friend"`.
That file looks like this: 

```text
<h1>Tosh</h1>
```

For now it's incredibly basic but this easily scales to complicated views
and ensures that all of the result is tested against, instead of the more
common approach that only checks for the presence of certain elements that
are thought to be relevant to a particular test.

### Where do fakes come into this?
 
Our `testApp` relies on a real database. So to keep our approval test fast
and to isolate it from database behaviours that we're not interested in
testing, we pass it a fake database. In this way, our `testApp` is exactly
the same as our real `App` except that its dependencies that we pass in are
all fakes.

```typescript
class TestApp {

    constructor(){
        const fakeFriendsDB = new FakeFriendsDB();
        const fakeFriendsService = new FriendsService(fakeFriendsDB);
        this.routes = new App(fakeFriendsService).routes();
    }
}
```

The `fakeFriendsService` is also the same as the real `FriendsService`
except that its dependency is fake. What does the `fakeFriendsDB` look
like? It implements the same interface as the real DB but has very 
basic smarts inside:

```typescript
class FakeFriendsDB implements FriendsDB {
    friends: Friend[] = [];

    constructor() {
        return this;
    }

    all(): Promise<Friend[]> {
        return Promise.resolve(this.friends);
    }

    add(friend: Friend): Promise<Friend> {
        this.friends.push(friend);
        return Promise.resolve(friend);
    }

    deleteAll(): void {
        this.friends = [];
    }
}

interface FriendsDB {
    all(): Promise<Array<Friend>>
    add(friend: Friend): Promise<Friend>
    deleteAll(): void
}
```
