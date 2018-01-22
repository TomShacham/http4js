import {HttpMessage, Request, Headers, Method} from "./HttpMessage";

export class InMemoryRequest implements Request {

    uri: string;
    method: string;
    headers: Headers;
    body: string;

    constructor(method: Method, uri: string, body: string = "", headers = null) {
        this.method = method.toString();
        this.uri = uri;
        this.body = body;
        this.headers = headers;
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

export class HttpRequest implements Request {
    method: string;
    headers: Headers;
    body: string;
    uri: string;

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