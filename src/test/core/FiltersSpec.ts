import {routes} from "../../main/core/Routing";
import {debugFilter, Filters} from "../../main/core/Filters";
import {equal} from "assert";
import {ResOf} from "../../main";
import {ReqOf} from "../../main/core/Req";
import {get} from "../../main/core/Routing";
import {Req} from "../../main/core/Req";
import {NativeHttpServer} from "../../main/servers/NativeHttpServer";
import {HttpClient} from "../../main/client/HttpClient";

describe("Built in filters", () => {

    it("upgrade to https", async() => {
        const server = get('/', async(req: Req) => ResOf(200, 'OK'))
            .withFilter(Filters.UPGRADE_TO_HTTPS)
            .asServer(new NativeHttpServer(3030))
        const response = await server.serveE2E(ReqOf('GET', '/'));
        equal(response.header('Location'), "https://localhost:3030/");
    });

    it("timing filter", async() => {
        const response = await routes("GET", "/", async () => ResOf(200, "OK"))
            .withFilter(Filters.TIMING)
            .serve(ReqOf("GET", "/"));

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
            .serve(ReqOf("GET", "/"));

        equal(logger.messages[0], 'GET to / with response 200');
    });

});