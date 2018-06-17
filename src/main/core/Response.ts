import {HttpMessage} from "./HttpMessage";
import {Uri} from "./Uri";

export class Response implements HttpMessage {
    uri: Uri;
    headers: {[key:string]: string} = {};
    body: string;
    status: number;

    constructor(status: number = 200, body: string = "", headers: {} = {}) {
        this.status = status;
        this.body = body;
        this.headers = headers;
    }

    header(name: string): string {
        return this.headers[name.toLowerCase()];
    }

    withHeader(name: string, value: string): Response {
        const response = Response.clone(this);
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

    withHeaders(headers: object): Response {
        const response = Response.clone(this);
        response.headers = headers;
        return response;
    }

    replaceAllHeaders(headers: object): Response {
        const response = Response.clone(this);
        response.headers = headers;
        return response;
    }

    replaceHeader(name: string, value: string): Response {
        const response = Response.clone(this);
        response.headers[name] = value;
        return response;
    }

    removeHeader(name: string): Response {
        const response = Response.clone(this);
        delete response.headers[name];
        return response;
    }

    withBody(body: string): Response {
        const response = Response.clone(this);
        response.body = body;
        return response;
    }

    bodyString(): string {
        return this.body;
    }

    private static clone(a: {}) {
        return Object.assign(Object.create(a), a)
    }

}

export function Res(status: number = 200, body: string = "", headers: {} = {}): Response {
    return new Response(status, body, headers);
}

export function Redirect(status: number = 301, path: string, headers: {} = {}): Response {
    return new Response(status, "", headers).withHeader("Location", path);
}

