import {HttpsClient} from "../../main/client/HttpsClient";
import {ReqOf} from "../../main";
import {equal} from "assert";

const https = require('https');
const fs = require('fs');
require('ssl-root-cas')
    .inject()
    .addFile('src/test/ssl/my-root-ca.cert.pem');

const options = {
    key: fs.readFileSync('src/test/ssl/key.pem'),
    cert: fs.readFileSync('src/test/ssl/fullchain.pem'),
    ca: fs.readFileSync('src/test/ssl/my-root-ca.cert.pem'),
};

https.createServer(options, (req, res) => {
    res.writeHead(200);
    res.end('hello world!');
}).listen(8006);

describe('https server', () => {

    it('serves a request', async () => {
        const response = await HttpsClient(ReqOf('GET', 'https://localhost:8006/'));
        equal(response.status, 200);
        equal(response.bodyString(), 'hello world!');
    });

});