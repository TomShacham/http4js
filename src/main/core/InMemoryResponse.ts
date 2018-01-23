import {HttpMessage, Body} from "./HttpMessage";

class Headers {}

interface Response extends HttpMessage {
    status: string;
}

export class InMemoryResponse implements HttpMessage {

    method: string;
    uri: string;
    headers: Headers;
    body: Body;
    status: string;

    constructor(status: string, body: Buffer | string) {
        this.status = status;
        this.body = new Body(body);
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

    setBody(body: string): HttpMessage {
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

