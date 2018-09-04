import {Uri} from "./Uri";
import {isNullOrUndefined} from "util";
import {Headers, HeaderValues} from "./Headers";
import {HttpMessage, HeadersType} from "./HttpMessage";
import {KeyValues} from "./HttpMessage";
import {Form} from "./HttpMessage";
import {Body, BodyOf} from "./Body";
import {FormField} from "./HttpMessage";
import {Readable} from "stream";

export class Req implements HttpMessage {

    uri: Uri;
    method: string;
    headers: HeadersType = {};
    body: Body;
    queries: KeyValues = {};
    pathParams: KeyValues = {};
    private form: Form = {};

    constructor(method: string,
                uri: Uri | string,
                body: Body | string = '',
                headers = {}) {
        this.method = method.toUpperCase();
        if (typeof uri == "string") {
            const uriNoTrailingSlash = uri.endsWith('/') && uri !== "/" ? uri.slice(0, -1) : uri;
            this.uri = Uri.of(uriNoTrailingSlash);
        } else {
            this.uri = uri;
        }
        this.body = typeof body === 'string' ? BodyOf(body) : body;
        this.headers = headers ? headers : {};
        this.queries = this.getQueryParams();
        return this;
    }

    withUri(uri: Uri | string): Req {
        const request = Req.clone(this);
        request.uri = typeof uri == "string" ? Uri.of(uri) : uri;
        return request;
    }

    header(name: string): string {
        return this.headers[name.toLowerCase()];
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
        request.headers[name.toLowerCase()] = value;
        return request;
    }

    removeHeader(name: string): Req {
        const request = Req.clone(this);
        delete(request.headers[name]);
        return request;
    }

    withBody(body: Body | Readable | string): Req {
        const request = Req.clone(this);
        request.body = body instanceof Body ? body : BodyOf(body);
        return request;
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

    private formBodystring(form: Form): string {
        let reduce: string[] = Object.keys(form).reduce((bodyParts: string[], field: string) => {
            typeof (form[field]) === "object"
                ? (form[field] as string[]).map(value => bodyParts.push(`${field}=${value}`))
                : bodyParts.push(`${field}=${form[field]}`);
            return bodyParts;
        }, []);
        return reduce.join("&");
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
                    body: Body | string = '',
                    headers = {}): Req {
    return new Req(method, uri, body, headers);
}