import {Http4jsRequest, Method} from "./HttpMessage";
import {Headers} from "./Headers";
import {Body} from "./Body";

export class Request implements Http4jsRequest {

    uri: string;
    method: string;
    headers: object = {};
    body: Body;

    constructor(
        method: Method,
        uri: string,
        body: Body = new Body(new Buffer("")),
        headers = null
    ) {
        this.method = method.toString();
        this.uri = uri;
        this.body = body;
        this.headers = headers ? headers : {};
        return this;
    }

    setUri(uri: string): Request {
        return undefined;
    }

    getHeader(name: string): string {
        return this.headers[name];
    }

    setHeader(name: string, value: string): Request {
        if (this.headers[name] == null) {
            this.headers[name] = value;
        } else if (typeof this.headers[name] == "string") {
            this.headers[name] = [this.headers[name], value];
        } else {
            this.headers[name].push(value);
        }
        return this;
    }

    allHeaders(headers: Headers): Request {
        return undefined;
    }

    replaceHeader(name: string, value: string): Request {
        return undefined;
    }

    removeHeader(name: string): Request {
        return undefined;
    }

    setBody(body: Body): Request {
        this.body = body;
        return this;
    }

    setBodystring(body: string): Request {
        return undefined;
    }

    headerValues(name: string): string[] {
        return undefined;
    }

    bodystring(): string {
        return undefined;
    }

}