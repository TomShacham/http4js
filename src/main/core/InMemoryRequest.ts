import {HttpMessage} from "./HttpMessage";

type HttpHandler = (Request) => Response

interface Response extends HttpMessage {

}

interface Router {
    match(request: Request): Response
}


interface Filter {
    invoke(fn: (HttpHandler) => HttpHandler): (HttpHandler) => Filter //takes "next" httpHandler and applies it after fn
    then(filter: Filter): Filter
}


export enum Method {
    GET = "GET", POST = "POST"
}

interface Http4jsRequest extends HttpMessage {
    method: string
}

export class InMemoryRequest implements Http4jsRequest {

    uri: string;
    method: string;
    headers: Headers;
    body: string;

    constructor(method: Method, uri: string) {
        this.method = method.toString();
        this.uri = uri;
        return this;
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
        this.body = body;
        return this;
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
