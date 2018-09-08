import {ResOf, get, Req, ReqOf} from "../../main";
import {Client} from "../../main/client/Client";
import {equal} from "assert";
import {HttpServer} from "../../main/servers/NativeServer";

describe('client', () => {
    const server = get('/', async(req: Req) => ResOf(200, JSON.stringify(req.headers)))
        .asServer(HttpServer(3045));

    before(() => {
        server.start()
    });

    after(() => {
        server.stop()
    });

    it('configure to add headers to every request it makes', async() => {
        const zipkinHeaders = {
            'x-b3-parentspanid': 'parentSpanId',
            'x-b3-traceid': 'traceId',
            'x-b3-spanid': 'spanId',
            'x-b3-sampled': '1',
            'x-b3-debug': 'true',
        };
        const zipkinClient = Client.withHeaders(zipkinHeaders);
        const res = await zipkinClient(ReqOf('GET', 'http://localhost:3045/'));
        const requestHeaders = JSON.parse(res.bodyString());

        equal(requestHeaders['x-b3-parentspanid'], zipkinHeaders['x-b3-parentspanid']);
        equal(requestHeaders['x-b3-spanid'], zipkinHeaders['x-b3-spanid']);
        equal(requestHeaders['x-b3-traceid'], zipkinHeaders['x-b3-traceid']);
        equal(requestHeaders['x-b3-sampled'], zipkinHeaders['x-b3-sampled']);
        equal(requestHeaders['x-b3-debug'], zipkinHeaders['x-b3-debug']);
    });

});