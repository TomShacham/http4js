import {routes} from "../../main/core/Routing";
import {Response, Res} from "../../main/core/Response";
import {Request} from "../../main/core/Request";
import {debugFilter, Filters} from "../../main/core/Filters";
import {equal} from "assert";

describe("Built in filters", () => {

    it("upgrade to https", async() => {
        const response = await routes("GET", "/", async (req) => Res(200, req.uri.protocol()))
            .withFilter(Filters.UPGRADE_TO_HTTPS)
            .serve(new Request("GET", "http:///" +
                ""));
        equal(response.bodyString(), "https");
    });

    it("timing filter", async() => {
        const response = await routes("GET", "/", async () => Res(200, "OK"))
            .withFilter(Filters.TIMING)
            .serve(new Request("GET", "/"));

        const requestTook10ms = parseInt(response.header("Total-Time")) < 10;
        equal(requestTook10ms, true);
    });

    it("debugging filter", async() => {
        function memoryLogger() {
            this.messages = [];
            this.log = (msg) => {
                this.messages.push(msg);
            }
        }

        const logger = new memoryLogger();

        const response = await routes("GET", "/", async () => Res(200, "OK"))
            .withFilter(debugFilter(logger))
            .serve(new Request("GET", "/"));

        equal(logger.messages[0], 'GET to / with response 200');
    });

});