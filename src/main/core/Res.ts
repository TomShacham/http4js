import {HttpMessage, HeadersType} from "./HttpMessage";
import {Body} from "./Body";
import {BodyOf} from "./Body";
import {Readable} from "stream";
import {Headers} from "./Headers";

export class Res implements HttpMessage {
    headers: HeadersType;
    body: Body;
    status: number;

    constructor(status: number = 200,
                body: Body | Readable | string = '',
                headers: Headers | HeadersType = Headers.of({})) {
        this.status = status;
        if (typeof body === 'string' || body instanceof Readable) {
            this.body = BodyOf(body);
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

    withBody(body: Body | Readable | string): Res {
        return ResOf(this.status, body, this.headers);
    }

    bodyString(): string {
        return this.body.bodyString() || '';
    }

    bodyStream(): Readable | undefined {
        return this.body.bodyStream();
    }

}

export function ResOf(status: number = 200,
                      body: Body | Readable | string = '',
                      headers: Headers | HeadersType = Headers.of({})): Res {
    return new Res(status, body, headers);
}

export function Redirect(status: number = 301, path: string, headers: HeadersType = {}): Res {
    return new Res(status, '', headers).withHeader("Location", path);
}

