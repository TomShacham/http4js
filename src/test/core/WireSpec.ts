import {routes} from "../../main/core/RoutingHttpHandler";
import {Request} from "../../main/core/Request";
import {Response} from "../../main/core/Response";
import {Body} from "../../main/core/Body";
import {Method} from "../../main/core/HttpMessage";
import {httpClient} from "../../main/core/Client";
import {deepEqual} from "assert";
import {equal} from "assert";

describe("real request", () => {

    let server = routes("/", (req: Request) => {
        let query = req.getQuery("tomQuery");
        return new Response(200, new Body(req.bodyString()))
            .setHeaders(req.headers)
            .setHeader("tomQuery", query);
    }).asServer(3000);


    before(() => {
        server.start();
    });

    it("sets body", () => {
        let request = new Request(Method.POST, "http://localhost:3000/", new Body("my humps"));
        return httpClient().post(request)
            .then(succ => {
                deepEqual(succ.bodyString(), "my humps")
            })
    });

    it("sets query params", () => {
        let request = new Request(Method.GET, "http://localhost:3000/")
            .query("tomQuery", "likes to party");

        return httpClient().get(request)
            .then(succ => {
                equal(succ.getHeader("tomquery"), "likes%20to%20party")
            })
    });

    it("sets multiple headers of same name", () => {
        let request = new Request(Method.GET, "http://localhost:3000/", null, {tom: ["smells", "smells more"]});
        return httpClient().get(request)
            .then(succ => {
                deepEqual(succ.getHeader("tom"), "smells, smells more")
            })
    });

    after(() => {
        server.stop();
    });

});
