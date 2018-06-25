import {HttpMessage} from "./HttpMessage";
import {Uri} from "./Uri";

export class Res implements HttpMessage {
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

    withHeader(name: string, value: string): Res {
        const response = Res.clone(this);
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

    withHeaders(headers: object): Res {
        const response = Res.clone(this);
        response.headers = headers;
        return response;
    }

    replaceAllHeaders(headers: object): Res {
        const response = Res.clone(this);
        response.headers = headers;
        return response;
    }

    replaceHeader(name: string, value: string): Res {
        const response = Res.clone(this);
        response.headers[name] = value;
        return response;
    }

    removeHeader(name: string): Res {
        const response = Res.clone(this);
        delete response.headers[name];
        return response;
    }

    withBody(body: string): Res {
        const response = Res.clone(this);
        response.body = body;
        return response;
    }

    bodyString(): string {
        return decodeURIComponent(this.body);
    }

    private static clone(a: {}) {
        return Object.assign(Object.create(a), a)
    }

}

export function ResOf(status: number = 200, body: string = "", headers: {} = {}): Res {
    return new Res(status, body, headers);
}

export function Redirect(status: number = 301, path: string, headers: {} = {}): Res {
    return new Res(status, "", headers).withHeader("Location", path);
}

