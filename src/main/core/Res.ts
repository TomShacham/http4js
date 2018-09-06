import {HttpMessage, HeadersType} from "./HttpMessage";
import {Body} from "./Body";
import {BodyOf} from "./Body";
import {Readable} from "stream";

export class Res implements HttpMessage {
    headers: HeadersType = {};
    body: Body;
    status: number;

    constructor(status: number = 200, body: Body | string = '', headers: HeadersType = {}) {
        this.status = status;
        this.body = typeof body === 'string' ? BodyOf(body) : body;
        this.headers = headers;
    }

    header(name: string): string {
        return this.headers[name.toLowerCase()];
    }

    withHeader(name: string, value: string): Res {
        const response = Res.clone(this);
        const lowercaseName = name.toLowerCase();
        if (response.headers[lowercaseName] == null) {
            response.headers[lowercaseName] = value;
        } else if (typeof response.headers[lowercaseName] == "string") {
            response.headers[lowercaseName] = [response.headers[lowercaseName], value];
        } else {
            response.headers[lowercaseName].push(value);
        }
        return response;
    }

    withHeaders(headers: HeadersType): Res {
        const response = Res.clone(this);
        response.headers = headers;
        return response;
    }

    replaceAllHeaders(headers: HeadersType): Res {
        const response = Res.clone(this);
        response.headers = headers;
        return response;
    }

    replaceHeader(name: string, value: string): Res {
        const response = Res.clone(this);
        response.headers[name] = value;
        return response;
    }

    removeHeader(name: string): Res {
        const response = Res.clone(this);
        delete response.headers[name];
        return response;
    }

    withBody(body: Body | string): Res {
        return ResOf(this.status, body, this.headers);
    }

    bodyString(): string {
        return this.body.bodyString() || '';
    }

    bodyStream(): Readable | undefined {
        return this.body.bodyStream();
    }

    private static clone(a: {}) {
        return Object.assign(Object.create(a), a)
    }

}

export function ResOf(status: number = 200, body: Body | string = '', headers: HeadersType = {}): Res {
    const wrappedBody = typeof body === 'string' ? BodyOf(body) : body;
    return new Res(status, wrappedBody, headers);
}

export function Redirect(status: number = 301, path: string, headers: HeadersType = {}): Res {
    return new Res(status, BodyOf(''), headers).withHeader("Location", path);
}

