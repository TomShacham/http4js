import {Http4jsRequest, Method} from "./HttpMessage";
import {Headers} from "./Headers";
import {Body} from "./Body";
import {Uri} from "./Uri";

export class Request implements Http4jsRequest {

    uri: Uri;
    method: string;
    headers: object = {};
    body: Body;
    private queries = {};

    constructor(
        method: Method,
        uri: Uri | string,
        body: Body = new Body(new Buffer("")),
        headers = null
    ) {
        this.method = method.toString();
        if (typeof uri == "string") {
            this.uri = Uri.of(uri);
        } else {
            this.uri = uri;
        }
        this.body = body;
        this.headers = headers ? headers : {};
        return this;
    }

    setUri(uri: Uri | string): Request {
        if (typeof uri == "string") {
            this.uri = Uri.of(uri);
        }
        return this;
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

    replaceHeader(name: string, value: string): Request {
        this.headers[name] = value;
        return this;
    }

    removeHeader(name: string): Request {
        delete(this.headers[name]);
        return this;
    }

    setBody(body: Body): Request {
        this.body = body;
        return this;
    }

    setBodystring(string: string): Request {
        this.body.bytes = string;
        return this;
    }

    bodystring(): string {
        return this.body.bodyString();
    }

    query(name: string, value: string): Request {
        let queries = Object.keys(this.queries);
        if (queries.length > 0) {
            this.uri.uriString += `&${name}=${value}`;
        } else {
            this.uri.uriString += `?${name}=${value}`;
        }
        this.queries[name] = value;
        return this;
    }

}