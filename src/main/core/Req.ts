import {Uri} from "./Uri";
import {isNullOrUndefined} from "util";
import {Headers, HeaderValues} from "./Headers";
import {HttpMessage, HeadersType} from "./HttpMessage";
import {KeyValues} from "./HttpMessage";
import {Form} from "./HttpMessage";
import {Body} from "./Body";
import {FormField} from "./HttpMessage";
import {Readable} from "stream";

export class Req implements HttpMessage {

    uri: Uri;
    method: string;
    headers: HeadersType;
    body: Body;
    queries: KeyValues = {};
    pathParams: KeyValues = {};
    private form: Form = {};

    constructor(method: string,
                uri: Uri | string,
                body: Body | Readable | string = '',
                headers: Headers | HeadersType = {}) {
        this.method = method.toUpperCase();
        if (typeof uri == "string") {
            const uriNoTrailingSlash = uri.endsWith('/') && uri !== "/" ? uri.slice(0, -1) : uri;
            this.uri = Uri.of(uriNoTrailingSlash);
        } else {
            this.uri = uri;
        }
        if (typeof body === 'string' || body instanceof Readable) {
            this.body = Body.of(body);
        } else {
            this.body = body;
        }
        this.headers = headers instanceof Headers ? headers.asObject() : headers;
        this.queries = this.getQueryParams(this.uri);
        return this;
    }

    withUri(uri: Uri | string): Req {
        return new Req(this.method, uri, this.body, Headers.of(this.headers));
    }

    header(name: string): string {
        return Headers.of(this.headers).header(name);
    }

    withHeader(name: string, value: string): Req {
        return new Req(this.method, this.uri, this.body, Headers.of(this.headers).withHeader(name, value));
    }

    withHeaders(headers: HeadersType): Req {
        return new Req(this.method, this.uri, this.body, Headers.of(this.headers).withHeaders(headers));
    }

    replaceHeader(name: string, value: string): Req {
        return new Req(this.method, this.uri, this.body, Headers.of(this.headers).replaceHeader(name, value));
    }

    replaceAllHeaders(headers: HeadersType): Req {
        return new Req(this.method, this.uri, this.body, Headers.of(this.headers).replaceAllHeaders(headers));
    }

    removeHeader(name: string): Req {
        return new Req(this.method, this.uri, this.body, Headers.of(this.headers).removeHeader(name));
    }

    withBody(body: Body | Readable | string): Req {
        return new Req(this.method, this.uri, body, this.headers);
    }

    withFormField(name: string, value: string | string[]): Req {
        const form = this.bodyForm();
        if (form[name]) {
            if (typeof form[name] === 'string') {
                (typeof value === 'string')
                    ? form[name] = [form[name] as string, value as string]
                    : form[name] = [form[name] as string, ...value as string[]]
            } else {
                (typeof value === 'string')
                    ? form[name] = [...form[name] as string[], value as string]
                    : form[name] = [...form[name] as string[], ...value as string[]]
            }
        } else {
            form[name] = value;
        }
        return this.withForm(form)
    }

    withForm(form: Form): Req {
        const bodyForm = this.formBodystring(form);
        const req = ReqOf(this.method, this.uri, bodyForm, this.headers);
        if (!req.header(Headers.CONTENT_TYPE)) {
            return req.withHeader(Headers.CONTENT_TYPE, HeaderValues.FORM);
        }
        return req;
    }

    formField(name: string): FormField | undefined {
        return this.bodyForm()[name];
    }

    bodyString(): string {
        return this.body.bodyString() || '';
    }

    bodyStream(): Readable | undefined {
        return this.body.bodyStream();
    }

    bodyForm(): Form {
        const form: Form = {};
        if (this.bodyString() === '') {
            return form;
        } else {
            this.bodyString().split("&").map(keyvalue => {
                const strings = keyvalue.split("=");
                const name = strings[0];
                const value = strings[1];
                if (form[name]) {
                    typeof (form[name]) === "string"
                        ? (form[name]) = [(form[name] as string), value]
                        : (form[name] as string[]).push(value);
                } else {
                    form[name] = value;
                }
            });
        }
        return form;
    }

    withQuery(name: string, value: string): Req {
        return new Req(this.method, this.uri.withQuery(name, value), this.body, this.headers);
    }

    withQueries(queries: KeyValues): Req {
        return Object.keys(queries).reduce((req: Req, query: string) => (
            req.withQuery(query, queries[query])
        ), this);
    }

    query(name: string): string {
        return this.queries[name];
    }

    private formBodystring(form: Form): string {
        let reduce: string[] = Object.keys(form).reduce((bodyParts: string[], field: string) => {
            typeof (form[field]) === "object"
                ? (form[field] as string[]).map(value => bodyParts.push(`${field}=${value}`))
                : bodyParts.push(`${field}=${form[field]}`);
            return bodyParts;
        }, []);
        return reduce.join("&");
    }

    private getQueryParams(uri: Uri): KeyValues {
        const queries: KeyValues = {};
        if (isNullOrUndefined(uri.queryString())) {
            return queries;
        }
        const pairs = uri.queryString().split("&");
        pairs.map(pair => {
            const split = pair.split("=");
            let value = 'Malformed URI component';
            try {
                value = decodeURIComponent(split[1]);
            } catch (e) {
                queries[split[0]] = value;
            }
            queries[split[0]] = value;
        });
        return queries;
    }

}

export function ReqOf(method: string,
                    uri: Uri | string,
                    body: Body | Readable | string = '',
                    headers = {}): Req {
    return new Req(method, uri, body, headers);
}