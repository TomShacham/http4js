import {HttpClient} from "../../main/client/HttpClient";
import {equal} from "assert";
import {Res} from "../../main/core/Res";
import {get} from "../../main/core/Routing";
import {HttpServer} from "../../main/servers/NativeServer";

describe('httpclient', () => {

    const server = get('/', async() => Res.OK('ok'))
        .asServer(HttpServer(3013));

    before(() => {
        server.start();
    });

    after(() => {
        server.stop();
    });

    it('can make a request given ReqOptions', async() => {
        const response = await HttpClient({method: 'GET', uri: 'http://localhost:3013/'});
        equal(response.bodyString(), 'ok');
    });
});