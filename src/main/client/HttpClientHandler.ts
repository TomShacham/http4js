import {Handler, HttpClient, HttpsClient, Req, Res} from '..';

export class HttpClientHandler implements Handler {
  public async handle(req: Req): Promise<Res> {
    return req.uri.protocol() === 'https'
      ? HttpsClient(req)
      : HttpClient(req);
  }
}