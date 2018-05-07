import {HttpMessage} from "./HttpMessage";
import {Body} from "./Body";
import {Uri} from "./Uri";

export class Response implements HttpMessage {
    uri: Uri;
    headers: object = {};
    body: Body;
    status: number;

    constructor(status: number = 200, body: Body | string = new Body("")) {
        this.body = typeof body == "string"
            ? new Body(body)
            : body;
        this.status = status;
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

    withBody(body: Body | string): Response {
        const response = Response.clone(this);
        typeof body == "string"
            ? response.body.bytes = body
            : response.body = body;
        return response;
    }

    bodyString(): string {
        return this.body.bodyString();
    }

    private static clone(a) {
        return Object.assign(Object.create(a), a)
    }

}

export function response(status: number = 200, body: Body | string = ""): Response {
    return new Response(status, body);
}

