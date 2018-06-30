import {ResOf} from "../../main/index";
import {get} from "../../main/index";
import {ReqOf} from "../../main/index";
import {equal} from "assert";
import {NativeHttpServer} from "../../main/servers/NativeHttpServer";
import {HttpClient} from "../../main/client/HttpClient";

describe('requiring http4js from index export file', () => {
    const port = 4001;
    const server = get('/', async() => ResOf(200, 'ok'))
        .asServer(new NativeHttpServer(port));

    it('serve a route', async () => {
        const res = await get('/', async() => ResOf(200, 'ok')).serve(ReqOf('GET', '/'))
        equal(res.bodyString(), 'ok')
    });

    it('serve a request over the wire', async () => {
        const res = await server.serveE2E(ReqOf('GET', '/'));
        equal(res.bodyString(), 'ok')
    });

    it('make an http request', async () => {
        server.start();
        const res = await HttpClient(ReqOf('GET', `http://localhost:${port}/`));
        server.stop();
        equal(res.bodyString(), 'ok')
    });
});
