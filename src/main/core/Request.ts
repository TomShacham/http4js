import {Body} from "./Body";
import {Uri} from "./Uri";
import {isNullOrUndefined} from "util";
import {Headers, HeaderValues} from "./Headers";

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
        this.method = method.toUpperCase();
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
                const strings = kv.split("=");
                if (strings.length > 1) this.form[strings[0]] = strings[1];
            })
        }
        return this;
    }

    setUri(uri: Uri | string): Request {
        const request = Request.clone(this);
        if (typeof uri == "string") {
            request.uri = Uri.of(uri);
        }
        return request;
    }

    getHeader(name: string): string {
        const request = Request.clone(this);
        return request.headers[name.toLowerCase()];
    }

    setHeader(name: string, value: string): Request {
        const request = Request.clone(this);
        const caseInsensitiveName = name.toLowerCase();
        if (request.headers[caseInsensitiveName] == null) {
            request.headers[caseInsensitiveName] = value;
        } else if (typeof request.headers[caseInsensitiveName] == "string") {
            request.headers[caseInsensitiveName] = [request.headers[caseInsensitiveName], value];
        } else {
            request.headers[caseInsensitiveName].push(value);
        }
        return request;
    }

    replaceHeader(name: string, value: string): Request {
        const request = Request.clone(this);
        request.headers[name] = value;
        return request;
    }

    removeHeader(name: string): Request {
        const request = Request.clone(this);
        delete(request.headers[name]);
        return request;
    }

    setBody(body: Body | string): Request {
        const request = Request.clone(this);
        typeof body == "string"
            ? request.body.bytes = body
            : request.body = body;
        return request;
    }

    setFormField(name: string, value: string | string[]): Request {
        const request = Request.clone(this);
        if (!request.getHeader(Headers.CONTENT_TYPE)) request.setHeader(Headers.CONTENT_TYPE, HeaderValues.FORM);
        if (request.form[name]) {
            typeof (request.form[name]) == "string"
                ? request.form[name] = [request.form[name], value]
                : request.form[name] = request.form[name].push(value);
        } else {
            request.form[name] = value;
        }
        return request;
    }

    setForm(form: object) {
        const request = Request.clone(this);
        if (!request.getHeader(Headers.CONTENT_TYPE)) request.setHeader(Headers.CONTENT_TYPE, HeaderValues.FORM)
        request.form = form;
        return request;
    }

    bodyString(): string {
        if (Object.keys(this.form).length > 0) {
            return this.formBodystring();
        } else {
            return this.body.bodyString();
        }
    }

    formBodystring() {
        let reduce = Object.keys(this.form).reduce((bodyParts, field) => {
            typeof (this.form[field]) == "object"
                ? this.form[field].map(value => bodyParts.push(`${field}=${value}`))
                : bodyParts.push(`${field}=${this.form[field]}`);
            return bodyParts;
        }, []);
        return reduce.join("&")
    }

    setQuery(name: string, value: string): Request {
        const request = Request.clone(this);
        request.queries[name] = value;
        request.uri = request.uri.withQuery(name, value);
        return request;
    }

    getQuery(name: string): string {
        const request = Request.clone(this);
        return request.queries[name];
    }

    private getQueryParams(): object {
        if (isNullOrUndefined(this.uri.query)) return {};
        const pairs = this.uri.query.split("&");
        pairs.map(pair => {
            const split = pair.split("=");
            this.queries[split[0]] = split[1]
        });
        return this.queries;
    }

    private static clone(a) {
        return Object.assign(Object.create(a), a);
    }
}

export function request(method: string,
                        uri: Uri | string,
                        body: Body | string = new Body(new Buffer("")),
                        headers = null){
    return new Request(method, uri, body, headers);
}