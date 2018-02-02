import * as assert from "assert";
import {equal} from "assert";
import {Request} from "../../main/core/Request";
import {Method} from "../../main/core/HttpMessage";
import {httpClient} from "../../main/core/Client";
import {routes} from "../../main/core/RoutingHttpHandler";
import {Response} from "../../main/core/Response";
import {Body} from "../../main/core/Body";
import {emitKeypressEvents} from "readline";
import {deepEqual} from "assert";

describe("in mem request", () => {

   it("set header on request", () => {
       equal(
           new Request(Method.GET, "some/url")
               .setHeader("tom", "smells")
               .getHeader("tom"),
           "smells");
   });

   it("concat same header on request", () => {
       assert.deepEqual(
           new Request(Method.GET, "some/url")
               .setHeader("tom", "smells")
               .setHeader("tom", "smells more")
               .setHeader("tom", "smells some more")
               .getHeader("tom"),
           ["smells", "smells more", "smells some more"]);
   });

});

describe("real request", () => {

    let server = routes("/", (req: Request) => {
        return new Response(new Body("new body")).setHeaders(req.headers);
    }).asServer(3000);


    before(() => {
        server.start();
    });

    it("sets multiple headers of same name", () => {
        let headers = {tom: ["smells", "smells more"]};
        return httpClient().get({host: "localhost", port: 3000, path: "/", headers: headers})
            .then(succ => {
                deepEqual(succ.getHeader("tom"), "smells, smells more")
            })
    });

    after(() => {
        server.stop();
    });

});