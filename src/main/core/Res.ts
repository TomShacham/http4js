import {HttpMessage, HeadersType} from "./HttpMessage";
import {Body} from "./Body";
import {BodyOf} from "./Body";
import {Readable} from "stream";

export class Res implements HttpMessage {
    headers: HeadersType = {};
    body: Body;
    status: number;

    constructor(status: number = 200,
                body: Body | Readable | string = '',
                headers: HeadersType = {}) {
        this.status = status;
        if (typeof body === 'string' || body instanceof Readable) {
            this.body = BodyOf(body);
        } else {
            this.body = body;
        }
        this.headers = headers;
    }

    header(name: string): string {
        return this.headers[name.toLowerCase()];
    }

    withHeader(name: string, value: string): Res {
        const headers: HeadersType = {...this.headers};
        const lowercaseName = name.toLowerCase();
        if (headers[lowercaseName] == null) {
            headers[lowercaseName] = value;
        } else if (typeof headers[lowercaseName] === "string") {
            headers[lowercaseName] = [...headers[lowercaseName].split(', '), value].join(', ');
        }
        return new Res(this.status, this.body, headers);
    }

    withHeaders(headers: HeadersType): Res {
        return new Res(this.status, this.body, {...this.headers, ...headers});
    }

    replaceAllHeaders(headers: HeadersType): Res {
        return new Res(this.status, this.body, headers);
    }

    replaceHeader(name: string, value: string): Res {
        const headers = {...this.headers};
        headers[name] = value;
        return new Res(this.status, this.body, headers);
    }

    removeHeader(name: string): Res {
        const headers = {...this.headers};
        delete headers[name];
        return new Res(this.status, this.body, headers);
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
                      headers: HeadersType = {}): Res {
    return new Res(status, body, headers);
}

export function Redirect(status: number = 301, path: string, headers: HeadersType = {}): Res {
    return new Res(status, '', headers).withHeader("Location", path);
}

