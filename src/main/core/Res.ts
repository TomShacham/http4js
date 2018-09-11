import {HttpMessage, HeadersType} from "./HttpMessage";
import {Body} from "./Body";
import {Readable} from "stream";
import {Headers} from "./Headers";
import {BodyType} from "./HttpMessage";

export class Res implements HttpMessage {
    headers: HeadersType;
    body: Body;
    status: number;

    constructor(status: number = 200,
                body: Body | BodyType = '',
                headers: Headers | HeadersType = Headers.of({})) {
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

    withHeaders(headers: HeadersType): Res {
        return new Res(this.status, this.body, Headers.of(this.headers).withHeaders(headers));
    }

    replaceHeader(name: string, value: string): Res {
        return new Res(this.status, this.body, Headers.of(this.headers).replaceHeader(name, value));
    }

    replaceAllHeaders(headers: HeadersType): Res {
        return new Res(this.status, this.body, headers);
    }

    removeHeader(name: string): Res {
        return new Res(this.status, this.body, Headers.of(this.headers).removeHeader(name));
    }

    withBody(body: Body | BodyType): Res {
        return ResOf(this.status, body, this.headers);
    }

    bodyString(): string {
        return this.body.bodyString() || '';
    }

    bodyStream(): Readable | undefined {
        return this.body.bodyStream();
    }

    static OK(body: BodyType, headers: {} = {}): Res {
        return new Res(200, body, headers)
    }

    static Created(body: BodyType, headers: {} = {}): Res {
        return new Res(201, body, headers)
    }

    static NoContent(body: BodyType, headers: {} = {}): Res {
        return new Res(204, body, headers)
    }

    static Redirect(status: number = 301, path: string, body: BodyType = '', headers: HeadersType = {}): Res {
        return new Res(status, body, headers).withHeader("Location", path);
    }

    static MovedPermanently(status: number = 301, body: BodyType = '', path: string, headers: HeadersType = {}): Res {
        return new Res(status, body, headers).withHeader("Location", path);
    }

    static Found(status: number = 302, body: BodyType = '', path: string, headers: HeadersType = {}): Res {
        return new Res(status, body, headers).withHeader("Location", path);
    }

    static SeeOther(status: number = 303, body: BodyType = '', path: string, headers: HeadersType = {}): Res {
        return new Res(status, body, headers).withHeader("Location", path);
    }

    static NotModified(status: number = 304, body: BodyType = '', path: string, headers: HeadersType = {}): Res {
        return new Res(status, body, headers).withHeader("Location", path);
    }

    static TemporaryRedirect(status: number = 307, body: BodyType = '', path: string, headers: HeadersType = {}): Res {
        return new Res(status, body, headers).withHeader("Location", path);
    }

    static BadRequest(status: number = 400, body: BodyType = '', path: string, headers: HeadersType = {}): Res {
        return new Res(status, body, headers).withHeader("Location", path);
    }

    static Unauthorized(status: number = 401, body: BodyType = '', path: string, headers: HeadersType = {}): Res {
        return new Res(status, body, headers).withHeader("Location", path);
    }

    static Forbidden(status: number = 403, body: BodyType = '', path: string, headers: HeadersType = {}): Res {
        return new Res(status, body, headers).withHeader("Location", path);
    }

    static NotFound(body: BodyType, headers: {} = {}): Res {
        return new Res(404, body, headers) ;
    }

    static InternalServerError(body: BodyType, headers: {} = {}): Res {
        return new Res(500, body, headers) ;
    }

    static BadGateway(body: BodyType, headers: {} = {}): Res {
        return new Res(502, body, headers) ;
    }

    static ServiceUnavailable(body: BodyType, headers: {} = {}): Res {
        return new Res(503, body, headers) ;
    }

    static GatewayTimeout(body: BodyType, headers: {} = {}): Res {
        return new Res(504, body, headers) ;
    }

}

export function ResOf(status: number = 200,
                      body: Body | BodyType = '',
                      headers: Headers | HeadersType = Headers.of({})): Res {
    return new Res(status, body, headers);
}


