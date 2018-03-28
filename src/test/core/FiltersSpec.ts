import {routes} from "../../main/core/RoutingHttpHandler";
import {Response} from "../../main/core/Response";
import {Request} from "../../main/core/Request";
import {Filters} from "../../main/core/Filters";
import {equal} from "assert";

describe("Built in filters", () => {

    it("upgrade to https", () => {
        return routes("GET", "/", (req) => {
            return new Promise(resolve => resolve(new Response(200, req.uri.protocol)));
        })
            .withFilter(Filters.UPGRADE_TO_HTTPS)
            .match(new Request("GET", "http:///"))
            .then(response => {
                equal(response.bodyString(), "https");
            });
    });

    it("timing filter", () => {
        return routes("GET", "/", (req) => {
            return new Promise(resolve => resolve(new Response(200, req.uri.protocol)));
        })
            .withFilter(Filters.TIMING)
            .match(new Request("GET", "/"))
            .then(response => {
                equal(response.getHeader("Total-Time"), "500");
            });
    });

    xit("debug filter", () => {
        return routes("GET", "/", (req) => {
            return new Promise(resolve => resolve(new Response(200, req.uri.protocol)));
        })
            .withFilter(Filters.DEBUG)
            .match(new Request("GET", "/"))
            .then(response => {
                console.log(response)
                equal(response.bodyString(), "debugged");
            });
    });

});