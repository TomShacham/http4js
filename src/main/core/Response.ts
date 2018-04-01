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

    getHeader(name: string): string {
        return this.headers[name.toLowerCase()];
    }

    setHeader(name: string, value: string): Response {
        const lowercaseName = name.toLowerCase();
        if (this.headers[lowercaseName] == null) {
            this.headers[lowercaseName] = value;
        } else if (typeof this.headers[lowercaseName] == "string") {
            this.headers[lowercaseName] = [this.headers[lowercaseName], value];
        } else {
            this.headers[lowercaseName].push(value);
        }
        return this;
    }

    setHeaders(headers: object): Response {
        this.headers = headers;
        return this;
    }

    allHeaders(headers: object): Response {
        return undefined;
    }

    replaceHeader(name: string, value: string): Response {
        this.headers[name] = value;
        return this;
    }

    removeHeader(name: string): Response {
        delete this.headers[name];
        return this;
    }

    setBody(body: Body | string): Response {
        typeof body == "string"
            ? this.body.bytes = body
            : this.body = body;
        return this;
    }

    bodyString(): string {
        return this.body.bodyString();
    }

}

export function response(status: number = 200, body: Body | string = ""){
    return new Response(status, body);
}

