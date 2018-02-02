import {HttpMessage} from "./HttpMessage";
import {Headers} from "./Headers";
import {Body} from "./Body";

interface Http4jsResponse extends HttpMessage {
}

export class Response implements Http4jsResponse {
    method: string;
    uri: string;
    headers: object = {};
    body: Body;

    constructor(body: Body) {
        this.body = body;
    }

    setUri(uri: string): Response {
        return undefined;
    }

    getHeader(name: string): string {
        return this.headers[name];
    }

    setHeader(name: string, value: string): Response {
        return undefined;
    }

    setHeaders(headers: object): Response {
        this.headers = headers;
        return this;
    }

    allHeaders(headers: Headers): Response {
        return undefined;
    }

    replaceHeader(name: string, value: string): Response {
        return undefined;
    }

    removeHeader(name: string): Response {
        return undefined;
    }

    setBody(body: Body): Response {
        return undefined;
    }

    setBodystring(body: string): Response {
        return undefined;
    }

    headerValues(name: string): string[] {
        return undefined;
    }

    bodystring(): string {
        return this.body.bodyString();
    }

}

