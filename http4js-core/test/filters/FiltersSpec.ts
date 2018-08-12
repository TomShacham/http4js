import {routes, get} from "../../src/core/Routing";
import {debugFilterBuilder, Filters} from "../../src/core/Filters";
import {equal} from "assert";
import {ResOf} from "../../src/core/Res";
import {ReqOf, Req} from "../../src/core/Req";
import {NativeHttpServer} from "../../src/servers/NativeHttpServer";

describe("Built in filters", () => {

    it("upgrade to https", async() => {
        const server = get('/', async(req: Req) => ResOf(200, 'OK'))
            .withFilter(Filters.UPGRADE_TO_HTTPS)
            .asServer(new NativeHttpServer(3030));
        const response = await server.serve(ReqOf('GET', 'http://localhost:3030/'));

        equal(response.header('Location'), "https://localhost:3030/");
    });

    it("timing filter", async() => {
        const response = await routes("GET", "/", async () => ResOf(200, "OK"))
            .withFilter(Filters.TIMING)
            .serve(ReqOf("GET", "/"));

        const startTimeAfter = parseInt(response.header("Start-Time")) > (new Date).getTime() - 10;
        const startTimeBefore = parseInt(response.header("Start-Time")) < (new Date).getTime() + 10;
        const endTimeAfter = parseInt(response.header("End-Time")) > (new Date).getTime() - 10;
        const endTimeBefore = parseInt(response.header("End-Time")) < (new Date).getTime() + 10;
        const requestTook10ms = parseInt(response.header("Total-Time")) < 10;

        equal(startTimeAfter, true);
        equal(startTimeBefore, true);
        equal(endTimeAfter, true);
        equal(endTimeBefore, true);
        equal(requestTook10ms, true);
    });

    it("debugging filter", async() => {
        class MemoryLogger {
            messages: string[] = [];
            public log(msg: string) {
                this.messages.push(msg);
            }
        }
        const logger = new MemoryLogger();
        const response = await routes("GET", "/", async () => ResOf(200, "OK"))
            .withFilter(debugFilterBuilder(logger))
            .serve(ReqOf("GET", "/"));

        equal(logger.messages[0], 'GET to / gave status 200 with headers {}');
    });

});