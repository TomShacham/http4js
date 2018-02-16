import {getTo} from "../../main/core/RoutingHttpHandler";
import {Request} from "../../main/core/Request";
import {Response} from "../../main/core/Response";
import {Body} from "../../main/core/Body";
import {deepEqual, equal} from "assert";
import {HttpClient} from "../../main/core/Client";

describe("real request", () => {

    let server = getTo("/", (req: Request) => {
        let query = req.getQuery("tomQuery");
        return new Response(200, new Body(req.bodyString()))
            .setHeaders(req.headers)
            .setHeader("tomQuery", query);
    })
        .withHandler("/post", "POST", (req) => {
            return new Response(200, new Body(req.bodyString()))
        })
        .asServer(3000);


    before(() => {
        server.start();
    });

    it("sets body", () => {
        let request = new Request("POST", "http://localhost:3000/", new Body("my humps"));
        return HttpClient(request)
            .then(succ => {
                deepEqual(succ.bodyString(), "my humps")
            })
    });

    it("sets query params", () => {
        let request = new Request("GET", "http://localhost:3000/")
            .query("tomQuery", "likes to party");

        return HttpClient(request)
            .then(succ => {
                equal(succ.getHeader("tomquery"), "likes%20to%20party")
            })
    });

    it("sets multiple headers of same name", () => {
        let request = new Request("GET", "http://localhost:3000/", null, {tom: ["smells", "smells more"]});
        return HttpClient(request)
            .then(succ => {
                deepEqual(succ.getHeader("tom"), "smells, smells more")
            })
    });

    after(() => {
        server.stop();
    });

});
