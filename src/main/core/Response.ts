import {HttpMessage, Body} from "./HttpMessage";
import {Headers} from "./Headers";

interface Http4jsResponse extends HttpMessage {
    status: number;
}

export class Response implements Http4jsResponse {
    method: string;
    uri: string;
    headers: Headers;
    body: Body;
    status: number;

    constructor(status: number, body: Body) {
        this.status = status;
        this.body = body;
    }

    setUri(uri: string): HttpMessage {
        return undefined;
    }

    getHeader(name: string): string {
        return undefined;
    }

    setHeader(name: string, value: string): HttpMessage {
        return undefined;
    }

    allHeaders(headers: Headers): HttpMessage {
        return undefined;
    }

    replaceHeader(name: string, value: string): HttpMessage {
        return undefined;
    }

    removeHeader(name: string): HttpMessage {
        return undefined;
    }

    setBody(body: Body): HttpMessage {
        return undefined;
    }

    setBodystring(body: string): HttpMessage {
        return undefined;
    }

    headerValues(name: string): string[] {
        return undefined;
    }

    bodystring(): string {
        return this.body.toString();
    }

}

