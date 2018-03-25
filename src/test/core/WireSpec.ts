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
        .asServer(3000);


    before(() => {
        server.start();
    });

    after(() => {
        server.stop();
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

});
