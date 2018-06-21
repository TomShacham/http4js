import {routes} from "../../main/core/Routing";
import {Req} from "../../main/core/Req";
import {debugFilter, Filters} from "../../main/core/Filters";
import {equal} from "assert";
import {ResOf} from "../../main";

describe("Built in filters", () => {

    it("upgrade to https", async() => {
        const response = await routes("GET", "/", async (req) => ResOf(200, req.uri.protocol()))
            .withFilter(Filters.UPGRADE_TO_HTTPS)
            .serve(new Req("GET", "http:///"));
        equal(response.bodyString(), "https");
    });

    it("timing filter", async() => {
        const response = await routes("GET", "/", async () => ResOf(200, "OK"))
            .withFilter(Filters.TIMING)
            .serve(new Req("GET", "/"));

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

        const response = await routes("GET", "/", async () => ResOf(200, "OK"))
            .withFilter(debugFilter(logger))
            .serve(new Req("GET", "/"));

        equal(logger.messages[0], 'GET to / with response 200');
    });

});