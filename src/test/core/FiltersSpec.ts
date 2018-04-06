import {routes} from "../../main/core/Routing";
import {Response} from "../../main/core/Response";
import {Request} from "../../main/core/Request";
import {debugFilter, Filters} from "../../main/core/Filters";
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
            return new Promise(resolve => resolve(new Response(200, "OK")));
        })
            .withFilter(Filters.TIMING)
            .match(new Request("GET", "/"))
            .then(response => {
                let requestTook10ms = parseInt(response.getHeader("Total-Time")) < 10;
                equal(requestTook10ms, true);
            });
    });

    it("debugging filter", () => {
        function memoryLogger() {
            this.messages = [];
            this.log = (msg) => {
                this.messages.push(msg);
            }
        }
        const logger = new memoryLogger();

        return routes("GET", "/", (req) => {
            return new Promise(resolve => resolve(new Response(200, "OK")));
        })
            .withFilter(debugFilter(logger))
            .match(new Request("GET", "/"))
            .then(response => {
                equal(logger.messages[0], 'GET to / with response 200');
            });
    });

});