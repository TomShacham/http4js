import {equal} from 'assert';
import * as fs from 'fs';
import {get, HttpsClient, HttpsServer, Method, Req, ReqOf, Res} from '../../main';

describe('httpsclient', () => {

  let lastPost: Req;
  let lastDelete: Req;

  const certs = {
    key: fs.readFileSync('src/ssl/key.pem'),
    cert: fs.readFileSync('src/ssl/fullchain.pem'),
    ca: fs.readFileSync('src/ssl/my-root-ca.cert.pem'),
  };

  const server = get('/', async () => Res.OK('ok'))
    .withDelete('/', async (req: Req) => {
      lastDelete = req;
      return Res.OK('ok')
    })
    .withPost('/', async (req: Req) => {
      lastPost = req;
      return Res.OK('ok')
    })
    .asServer(HttpsServer(3014, certs));

  before(() => {
    require('ssl-root-cas')
      .inject()
      .addFile('src/ssl/my-root-ca.cert.pem');
    server.start();
  });

  after(() => {
    server.stop();
  });

  it('can make a request given ReqOptions', async () => {
    const response = await HttpsClient({method: 'GET', uri: 'https://localhost:3014/'});
    equal(response.bodyString(), 'ok');
  });

  it('posts body content to server', async () => {
    lastPost = ReqOf(Method.GET, '/');
    const response = await HttpsClient({method: 'POST', uri: 'https://localhost:3014/', body: 'some body'});
    equal(response.bodyString(), 'ok');
    equal(lastPost.bodyString(), 'some body');
  });

  it('delete sends body content to server', async () => {
    lastDelete = ReqOf(Method.GET, '/');
    const response = await HttpsClient({method: 'DELETE', uri: 'https://localhost:3014/', body: 'some body'});
    equal(response.bodyString(), 'ok');
    equal(lastDelete.bodyString(), 'some body');
  });
});