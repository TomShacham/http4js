import {BodyContent, HeadersJson, HttpMessage} from "./HttpMessage";
import {Body} from "./Body";
import {Readable} from "stream";
import {Headers} from "./Headers";

export class Res implements HttpMessage {
    headers: HeadersJson;
    body: Body;
    status: number;

    constructor(status: number = 200,
                body: Body | BodyContent = '',
                headers: Headers | HeadersJson = Headers.of({})) {
        this.status = status;
        if (typeof body === 'string' || body instanceof Readable) {
            this.body = Body.of(body);
        } else {
            this.body = body;
        }
        this.headers = headers instanceof Headers ? headers.asObject() : headers;
    }

    header(name: string): string {
        return Headers.of(this.headers).header(name);
    }

    withHeader(name: string, value: string): Res {
        return new Res(this.status, this.body, Headers.of(this.headers).withHeader(name, value));
    }

    withHeaders(headers: HeadersJson): Res {
        return new Res(this.status, this.body, Headers.of(this.headers).withHeaders(headers));
    }

    replaceHeader(name: string, value: string): Res {
        return new Res(this.status, this.body, Headers.of(this.headers).replaceHeader(name, value));
    }

    replaceAllHeaders(headers: HeadersJson): Res {
        return new Res(this.status, this.body, headers);
    }

    removeHeader(name: string): Res {
        return new Res(this.status, this.body, Headers.of(this.headers).removeHeader(name));
    }

    withBody(body: Body | BodyContent): Res {
        return ResOf(this.status, body, this.headers);
    }

    bodyString(): string {
        return this.body.bodyString() || '';
    }

    bodyStream(): Readable | undefined {
        return this.body.bodyStream();
    }

    async fullBodyString(): Promise<string> {
        return this.body.fullBodyString();
    }

    static OK(body: BodyContent, headers: {} = {}): Res {
        return new Res(200, body, headers)
    }

    static Created(body: BodyContent, headers: {} = {}): Res {
        return new Res(201, body, headers)
    }

    static NoContent(body: BodyContent, headers: {} = {}): Res {
        return new Res(204, body, headers)
    }

    static Redirect(status: number = 301, path: string, body: BodyContent = '', headers: HeadersJson = {}): Res {
        return new Res(status, body, headers).withHeader("Location", path);
    }

    static MovedPermanently(path: string, body: BodyContent = '', headers: HeadersJson = {}): Res {
        return new Res(301, body, headers).withHeader("Location", path);
    }

    static Found(path: string, body: BodyContent = '', headers: HeadersJson = {}): Res {
        return new Res(302, body, headers).withHeader("Location", path);
    }

    static SeeOther(path: string, body: BodyContent = '', headers: HeadersJson = {}): Res {
        return new Res(303, body, headers).withHeader("Location", path);
    }

    static NotModified(path: string, body: BodyContent = '', headers: HeadersJson = {}): Res {
        return new Res(304, body, headers).withHeader("Location", path);
    }

    static TemporaryRedirect(path: string, body: BodyContent = '', headers: HeadersJson = {}): Res {
        return new Res(307, body, headers).withHeader("Location", path);
    }

    static BadRequest(body: BodyContent = '', headers: HeadersJson = {}): Res {
        return new Res(400, body, headers);
    }

    static Unauthorized(body: BodyContent = '', headers: HeadersJson = {}): Res {
        return new Res(401, body, headers);
    }

    static Forbidden(body: BodyContent = '', headers: HeadersJson = {}): Res {
        return new Res(403, body, headers);
    }

    static NotFound(body: BodyContent, headers: {} = {}): Res {
        return new Res(404, body, headers) ;
    }

    static InternalServerError(body: BodyContent, headers: {} = {}): Res {
        return new Res(500, body, headers) ;
    }

    static BadGateway(body: BodyContent, headers: {} = {}): Res {
        return new Res(502, body, headers) ;
    }

    static ServiceUnavailable(body: BodyContent, headers: {} = {}): Res {
        return new Res(503, body, headers) ;
    }

    static GatewayTimeout(body: BodyContent, headers: {} = {}): Res {
        return new Res(504, body, headers) ;
    }

}

export function ResOf(status: number = 200,
                      body: Body | BodyContent = '',
                      headers: Headers | HeadersJson = Headers.of({})): Res {
    return new Res(status, body, headers);
}


