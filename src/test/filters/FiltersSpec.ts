import {routes, get} from "../../main/core/Routing";
import {debugFilterBuilder, Filters} from "../../main/core/Filters";
import {equal} from "assert";
import {ResOf} from "../../main/core/Res";
import {ReqOf, Req} from "../../main/core/Req";
import {HttpServer} from "../../main/servers/NativeServer";
import * as zlib from 'zlib';
import * as fs from 'fs';
const { Readable } = require('stream');
import {Headers} from "../../main";

describe("Built in filters", () => {

    it("upgrade to https", async() => {
        const server = get('/', async(req: Req) => ResOf(200, 'OK'))
            .withFilter(Filters.UPGRADE_TO_HTTPS)
            .asServer(HttpServer(3030));
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
        class MemoryLogger {
            messages: string[] = [];
            log(msg: string ) {
                this.messages.push(msg);
            }
        }
        const logger = new MemoryLogger();
        const response = await routes("GET", "/", async () => ResOf(200, "OK"))
            .withFilter(debugFilterBuilder(logger))
            .serve(ReqOf("GET", "/"));

        equal(logger.messages[0], 'GET to / gave status 200 with headers {}');
    });

    it("gzip filter", async ()=> {
      const inStream = new Readable({
        read() {}
      });
      inStream.push('ungzipped response');
      inStream.push(null); // No more data

      const gzippedBody = inStream.pipe(zlib.createGzip());
      const gzippedReq = ReqOf("POST", "/gzip").withBody(gzippedBody).withHeader(Headers.CONTENT_ENCODING, 'gzip');

      const response = await routes("POST", "/gzip", async (req: Req) => {
        return ResOf(200, req.bodyStream())
      })
        .withFilter(Filters.GZIP)
        .serve(gzippedReq);

      removeFile('./foo');

      response.bodyStream()!.pipe(fs.createWriteStream('./foo'));
      await new Promise(res => setTimeout(() => res(), 100));
      const message = fs.readFileSync('./foo', 'utf-8');

      equal(message, 'ungzipped response');
      removeFile('./foo');
    })

});


function removeFile(path: string) {
  try {
    fs.unlinkSync(path);
  } catch (e) {
  }
}
