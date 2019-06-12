import {asHandler, Method, Req, ReqOf, ResOf} from '../../main';
import {equal} from 'assert';

describe('HttpMessage', () => {
  it('converts httpHandler to handler interface', async () => {
    const expectedResponse = ResOf(200, 'some body');
    const handler = asHandler(async (req: Req) => expectedResponse);
    equal(await handler.handle(ReqOf(Method.GET, 'http://some.uri')), expectedResponse);
  });
});