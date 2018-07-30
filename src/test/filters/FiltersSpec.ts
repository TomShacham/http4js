import {routes, get} from "../../main/core/Routing";
import {debugFilterBuilder, Filters} from "../../main/core/Filters";
import {equal} from "assert";
import {ResOf} from "../../main/core/Res";
import {ReqOf, Req} from "../../main/core/Req";
import {NativeHttpServer} from "../../main/servers/NativeHttpServer";

describe("Built in filters", () => {

    it("upgrade to https", async() => {
        const server = get('/', async(req: Req) => ResOf(200, 'OK'))
            .withFilter(Filters.UPGRADE_TO_HTTPS)
            .asServer(new NativeHttpServer(3030));
        const response = await server.serveE2E(ReqOf('GET', '/'));

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
        function memoryLogger() {
            this.messages = [];
            this.log = (msg) => {
                this.messages.push(msg);
            }
        }
        const logger = new memoryLogger();
        const response = await routes("GET", "/", async () => ResOf(200, "OK"))
            .withFilter(debugFilterBuilder(logger))
            .serve(ReqOf("GET", "/"));

        equal(logger.messages[0], 'GET to / gave status 200 with headers {}');
    });

});