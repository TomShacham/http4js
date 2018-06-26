import {Uri} from "./Uri";
import {isNullOrUndefined} from "util";
import {Headers, HeaderValues} from "./Headers";
import {HttpMessage} from "./HttpMessage";
import {KeyValues} from "./HttpMessage";
import {Form} from "./HttpMessage";

export class Req implements HttpMessage {

    uri: Uri;
    method: string;
    headers: KeyValues = {};
    body: string;
    queries: KeyValues = {};
    pathParams: KeyValues = {};
    form: Form = {};
    error?: {status: string, message: string};

    constructor(method: string,
                uri: Uri | string,
                body: string = "",
                headers = {}) {
        this.method = method.toUpperCase();
        if (typeof uri == "string") {
            const uriNoTrailingSlash = uri.endsWith('/') && uri !== "/" ? uri.slice(0, -1) : uri;
            this.uri = Uri.of(uriNoTrailingSlash);
        } else {
            this.uri = uri;
        }
        this.body = body;
        this.headers = headers ? headers : {};
        this.queries = this.getQueryParams();
        if (this.method == "POST") {
            this.body.split("&").map(kv => {
                const pair = kv.split("=");
                if (pair.length > 1) this.form[pair[0]] = pair[1];
            })
        }
        return this;
    }

    withUri(uri: Uri | string): Req {
        const request = Req.clone(this);
        request.uri = typeof uri == "string" ? Uri.of(uri) : uri;
        return request;
    }

    header(name: string): string {
        const request = Req.clone(this);
        return request.headers[name.toLowerCase()];
    }

    withHeader(name: string, value: string): Req {
        const request = Req.clone(this);
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

    replaceHeader(name: string, value: string): Req {
        const request = Req.clone(this);
        request.headers[name] = value;
        return request;
    }

    removeHeader(name: string): Req {
        const request = Req.clone(this);
        delete(request.headers[name]);
        return request;
    }

    withBody(body: string): Req {
        const request = Req.clone(this);
        request.body = body;
        return request;
    }

    withFormField(name: string, value: string | string[]): Req {
        const request = Req.clone(this);
        if (!request.header(Headers.CONTENT_TYPE)) request.withHeader(Headers.CONTENT_TYPE, HeaderValues.FORM);
        if (request.form[name]) {
            typeof (request.form[name]) == "string"
                ? request.form[name] = [request.form[name], value]
                : request.form[name].push(value);
        } else {
            request.form[name] = value;
        }
        return request;
    }

    withForm(form: {}): Req {
        const request = Req.clone(this);
        if (!request.header(Headers.CONTENT_TYPE)) request.withHeader(Headers.CONTENT_TYPE, HeaderValues.FORM);
        request.form = form;
        return request;
    }

    bodyString(): string {
        if (Object.keys(this.form).length > 0) {
            return this.formBodystring();
        } else {
            return this.body;
        }
    }

    formBodystring(): string {
        let reduce: string[] = Object.keys(this.form).reduce((bodyParts: string[], field: string) => {
            typeof (this.form[field]) === "object"
                ? (this.form[field] as string[]).map(value => bodyParts.push(`${field}=${value}`))
                : bodyParts.push(`${field}=${this.form[field]}`);
            return bodyParts;
        }, []);
        return reduce.join("&")
    }

    withQuery(name: string, value: string): Req {
        const request = Req.clone(this);
        request.queries[name] = decodeURIComponent(value);
        request.uri = request.uri.withQuery(name, value);
        return request;
    }

    withQueries(queries: KeyValues): Req {
        const request = Req.clone(this);
        for (let name in queries){
            const value = queries[name];
            request.queries[name] = decodeURIComponent(value);
            request.uri = request.uri.withQuery(name, value);
        }
        return request;
    }

    query(name: string): string {
        return this.queries[name];
    }

    private getQueryParams(): KeyValues {
        if (isNullOrUndefined(this.uri.queryString())) return {};
        const pairs = this.uri.queryString().split("&");
        pairs.map(pair => {
            const split = pair.split("=");
            let value = 'Malformed URI component';
            try {
                value = decodeURIComponent(split[1]);
            } catch (e) {
                this.queries[split[0]] = value;
            }
            this.queries[split[0]] = value;
        });
        return this.queries;
    }

    private static clone(a: {}) {
        return Object.assign(Object.create(a), a);
    }
}

export function ReqOf(method: string,
                    uri: Uri | string,
                    body: string = "",
                    headers = {}): Req {
    return new Req(method, uri, body, headers);
}