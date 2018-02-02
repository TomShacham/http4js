import {equal} from "assert";
import {routes} from "../../main/core/RoutingHttpHandler";
import {Response} from "../../main/core/Response";
import {Body} from "../../main/core/Body";
import {Request} from "../../main/core/Request";
import {Method} from "../../main/core/HttpMessage";
import {deepEqual} from "assert";
import {httpClient} from "../../main/core/Client";

describe('a basic in memory server', () => {

    it('takes request and gives response', function () {
        let requestBody = "Got it.";
        let handler = (req: Request) => { return new Response(req.body); };
        let resourceRoutingHttpHandler = routes("/test", handler);
        let response = resourceRoutingHttpHandler.match(new Request(Method.GET, "/test", new Body(requestBody)));

        equal(response.body.bodyString(), requestBody)
    });

});

describe("real request", () => {

    let server = routes("/", (req: Request) => {
        let query = req.getQuery("tomQuery");
        console.log(query)
        return new Response(new Body(req.bodyString()))
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
        let request = new Request(Method.GET, "http://localhost:3000/", new Body("my humps"), {tom: ["smells", "smells more"]});
        return httpClient().get(request)
            .then(succ => {
                deepEqual(succ.getHeader("tom"), "smells, smells more")
            })
    });

    after(() => {
        server.stop();
    });

});
