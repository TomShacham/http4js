import * as fs from "fs";
import {equal} from "assert";
import {HttpsClient} from "../../main/client/HttpsClient";
import {get} from "../../main/core/Routing";
import {ResOf} from "../../main/core/Res";
import {ReqOf} from "../../main/core/Req";
import {HttpsServer} from "../../main/servers/NativeServer";

describe('https server', () => {

    const certs = {
        key: fs.readFileSync('src/ssl/key.pem'),
        cert: fs.readFileSync('src/ssl/fullchain.pem'),
        ca: fs.readFileSync('src/ssl/my-root-ca.cert.pem'),
    };

    const httpsServer = get('/', async() => ResOf(200, 'hello, world!'))
        .withPost('/', async() => ResOf(200, 'hello, world!'))
        .asServer(HttpsServer(8000, certs));

    before(() => {
        require('ssl-root-cas')
            .inject()
            .addFile('src/ssl/my-root-ca.cert.pem');
        httpsServer.start();
    });

    after(() => {
        httpsServer.stop();
    });

    it('serves a get request', async() => {
        const response = await HttpsClient(ReqOf('GET', 'https://localhost:8000/'));
        equal(response.status, 200);
        equal(response.bodyString(), 'hello, world!');
    });

    it('serves a post request', async() => {
        const response = await HttpsClient(ReqOf('POST', 'https://localhost:8000/'));
        equal(response.status, 200);
        equal(response.bodyString(), 'hello, world!');
    });

});