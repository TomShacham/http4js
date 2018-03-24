import {getTo} from "../../main/core/RoutingHttpHandler";
import {Request} from "../../main/core/Request";
import {Response} from "../../main/core/Response";
import {Body} from "../../main/core/Body";
import {deepEqual, equal} from "assert";
import {HttpClient} from "../../main/core/Client";

describe("real request", () => {

    let friends = [];

    let baseUrl = "http://localhost:3000";

    let server = getTo("/", (req: Request) => {
        let query = req.getQuery("tomQuery");
        return new Promise(resolve => {
            resolve(
                new Response(200, new Body(req.bodyString()))
                    .setHeaders(req.headers)
                    .setHeader("tomQuery", query || "no tom query")
            )
        })

    })
        .withHandler("/post", "POST", (req) => {
            return new Promise(resolve => resolve(new Response(200, new Body(req.bodyString()))));
        })
        .withHandler("/family", "GET", () => {
            return new Promise(resolve => resolve(new Response(200, new Body(friends.join(", ")))));
        })
        .withHandler("/family/{name}", "GET", () => {
            return new Promise(resolve => resolve(new Response(200, new Body("fuzzy"))));
        })
        .withHandler("/family", "POST", (req) => {
            friends.push(req.form["name"]);
            return new Promise(resolve => resolve(new Response(302).setHeader("Location", "/family")));
        })

        .asServer(3000);

    let anotherServer = getTo("/", (req) => {
        return new Promise(resolve => resolve(new Response(200, new Body("Hello, world!"))));
    })
        .withHandler("/friends", "GET", (req) => {
            let queries = req.queries;
            let searchTerm = queries["name"];
            let filteredFriends = searchTerm
                ? friends.filter(f => f.indexOf(searchTerm) > -1)
                : friends;

            let html = filteredFriends.join(", ");

            return new Promise(resolve => resolve(new Response(200, new Body(html))))
        })

        .withHandler("/friends/{name}", "GET", (req) => {
            let name = req.pathParams["name"];
            let filter = name
                ? friends.filter(it => it.indexOf(name) > -1)
                : friends;
            return new Promise(resolve => resolve(new Response(200, new Body(filter.join(",")))));
        })

        .withHandler("/friends", "POST", (req) => {
            let newFriend = req.form["name"];
            friends.push(newFriend);
            let html = `<p>${friends.join("</p><p>")}</p>
                            <form method="post"><input type="text" name="name"/><input type="submit"></form>`;

            return new Promise(resolve => resolve(new Response(200, new Body(html))))

        })
        .withFilter((handler) => (req) => {
            let response = handler(req);
            if (response.status == 404) {
                return new Promise(resolve => resolve(new Response(404, new Body("Page not found"))));
            } else {
                return new Promise(resolve => resolve(response));
            }
        })
        .asServer(3001);


    before(() => {
        server.start();
        anotherServer.start();
    });

    after(() => {
        server.stop();
        anotherServer.stop();
    });

    it("sets body", () => {
        let request = new Request("POST", `${baseUrl}/post`, new Body("my humps"));
        return HttpClient(request)
            .then(succ => {
                equal(succ.bodyString(), "my humps")
            })
    });

    it("sets query params", () => {
        let request = new Request("GET", baseUrl)
            .query("tomQuery", "likes to party");

        return HttpClient(request)
            .then(succ => {
                equal(succ.getHeader("tomquery"), "likes%20to%20party")
            })
    });

    it("sets multiple headers of same name", () => {
        let request = new Request("GET", baseUrl, null, {tom: ["smells", "smells more"]});
        return HttpClient(request)
            .then(succ => {
                deepEqual(succ.getHeader("tom"), "smells, smells more")
            })
    });

    it("Post redirect.", () => {
        let postSideEffect1 = new Request("POST", `http://localhost:3001/friends`, new Body("name=tosh"));
        let getFriends = new Request("GET", `http://localhost:3001/friends`);
        return HttpClient(postSideEffect1)
            .then(_ => HttpClient(postSideEffect1).then(_ =>
                HttpClient(getFriends).then(
                    s => equal(s.bodyString(), "tosh, tosh")
                )));
    })

});
