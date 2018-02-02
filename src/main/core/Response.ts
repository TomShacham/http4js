import {HttpMessage} from "./HttpMessage";
import {Headers} from "./Headers";
import {Body} from "./Body";
import {Uri} from "./Uri";

interface Http4jsResponse extends HttpMessage {
}

export class Response implements Http4jsResponse {
    uri: Uri;
    headers: object = {};
    body: Body;

    constructor(body: Body = new Body("")) {
        this.body = body;
    }

    getHeader(name: string): string {
        return this.headers[name];
    }

    setHeader(name: string, value: string): Response {
        if (this.headers[name] == null) {
            this.headers[name] = value;
        } else if (typeof this.headers[name] == "string") {
            this.headers[name] = [this.headers[name], value];
        } else {
            this.headers[name].push(value);
        }
        return this;
    }

    setHeaders(headers: object): Response {
        this.headers = headers;
        return this;
    }

    allHeaders(headers: Headers): Response {
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

    setBody(body: Body): Response {
        this.body = body;
        return this;
    }

    setBodystring(bodyString: string): Response {
        this.body.bytes = bodyString;
        return this;
    }

    bodystring(): string {
        return this.body.bodyString();
    }

}

