import {equal} from 'assert';
import {get, HttpClient, HttpServer, Method, Req, ReqOf, Res} from '../../main';

describe('httpclient', () => {
  let lastPost: Req;

  const server = get('/', async () => Res.OK('ok'))
    .withPost('/', async (req: Req) => {
      lastPost = req;
      return Res.OK('ok')
    })
    .asServer(HttpServer(3013));

  before(() => {
    server.start();
  });

  after(() => {
    server.stop();
  });

  it('can make a request given ReqOptions', async () => {
    const response = await HttpClient({method: 'GET', uri: 'http://localhost:3013/'});
    equal(response.bodyString(), 'ok');
  });

  it('posts body content to server', async () => {
    lastPost = ReqOf(Method.GET, '/');
    const response = await HttpClient({method: 'POST', uri: 'http://localhost:3013/', body: 'some body'});
    equal(response.bodyString(), 'ok');
    equal(lastPost.bodyString(), 'some body');
  })
});