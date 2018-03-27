import {Body} from "./Body";
import {Uri} from "./Uri";
import {isNullOrUndefined} from "util";

export class Request {

    uri: Uri;
    method: string;
    headers: object = {};
    body: Body;
    queries = {};
    pathParams: object;
    form: object = {};

    constructor(method: string,
                uri: Uri | string,
                body: Body | string = new Body(new Buffer("")),
                headers = null) {
        this.method = method;
        if (typeof uri == "string") {
            this.uri = Uri.of(uri);
        } else {
            this.uri = uri;
        }
        this.body = typeof body == "string"
            ? new Body(body)
            : body;
        this.headers = headers ? headers : {};
        this.queries = this.getQueryParams();
        if (this.method == "POST") {
            this.body.bodyString().split("&").map(kv => {
                let strings = kv.split("=");
                this.form[strings[0]] = strings[1];
            })
        }
        return this;
    }

    private getQueryParams(): object {
        if (isNullOrUndefined(this.uri.query)) return {};
        let pairs = this.uri.query.split("&");
        pairs.map(pair => {
            let split = pair.split("=");
            this.queries[split[0]] = split[1]
        });
        return this.queries;
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

    setBody(body: Body | string): Request {
        typeof body == "string"
            ? this.body.bytes = body
            : this.body = body;
        return this;
    }

    bodyString(): string {
        return this.body.bodyString();
    }

    query(name: string, value: string): Request {
        this.queries[name] = value;
        this.uri = this.uri.withQuery(name, value);
        return this;
    }

    getQuery(name: string): string {
        return this.queries[name];
    }

}

export function request(method: string,
                        uri: Uri | string,
                        body: Body | string = new Body(new Buffer("")),
                        headers = null){
    return new Request(method, uri, body, headers);
}