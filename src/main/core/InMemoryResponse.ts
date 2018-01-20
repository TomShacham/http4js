import {HttpMessage} from "./HttpMessage";

class Headers {}


interface Response extends HttpMessage {

}

export class InMemoryResponse implements HttpMessage {
    setQuery(name: string, value: string): Response {
        return undefined;
    }

    getQuery(name: string): string {
        return undefined;
    }
    method: string;
    uri: string;
    headers: Headers;
    body: string;
    status: string;

    constructor(status: string, body: string) {
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
        return undefined;
    }

}