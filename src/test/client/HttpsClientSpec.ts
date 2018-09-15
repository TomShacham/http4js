import {equal} from "assert";
import {Res} from "../../main/core/Res";
import {get} from "../../main/core/Routing";
import {HttpsServer} from "../../main/servers/NativeServer";
import {HttpsClient} from "../../main/client/HttpsClient";
import * as fs from 'fs';

describe('httpsclient', () => {

    const certs = {
        key: fs.readFileSync('src/ssl/key.pem'),
        cert: fs.readFileSync('src/ssl/fullchain.pem'),
        ca: fs.readFileSync('src/ssl/my-root-ca.cert.pem'),
    };

    const server = get('/', async() => Res.OK('ok'))
        .asServer(HttpsServer(3014, certs));

    before(() => {
        server.start();
    });

    after(() => {
        server.stop();
    });

    it('can make a request given ReqOptions', async() => {
        const response = await HttpsClient({method: 'GET', uri: 'https://localhost:3014/'});
        equal(response.bodyString(), 'ok');
    });
});