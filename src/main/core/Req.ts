import {Uri} from "./Uri";
import {isNullOrUndefined} from "util";
import {Headers, HeaderValues} from "./Headers";
import {HttpMessage, HeadersType, KeyValues, FormField, BodyType} from "./HttpMessage";
import {Body} from "./Body";
import {Readable} from "stream";
import {FormType} from "./HttpMessage";
import {Form} from "./Form";

export class Req implements HttpMessage {

    uri: Uri;
    method: string;
    headers: HeadersType;
    body: Body;
    queries: KeyValues = {};
    pathParams: KeyValues = {};
    private form: FormType = {};

    constructor(method: string,
                uri: Uri | string,
                body: Body | BodyType = '',
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

    withBody(body: Body | BodyType): Req {
        return new Req(this.method, this.uri, body, this.headers);
    }

    withFormField(name: string, value: FormField): Req {
        const form = Form.of(this.bodyForm()).withFormField(name, value).asObject();
        return this.withForm(form)
    }

    withForm(form: FormType): Req {
        return ReqOf(this.method, this.uri, Form.of(form).formBodyString(), this.headers)
            .replaceHeader(Headers.CONTENT_TYPE, HeaderValues.FORM);
    }

    formField(name: string): FormField | undefined {
        return Form.of(this.bodyForm()).field(name);
    }

    bodyString(): string {
        return this.body.bodyString() || '';
    }

    bodyStream(): Readable | undefined {
        return this.body.bodyStream();
    }

    bodyForm(): FormType {
        return Form.fromBodyString(this.bodyString()).asObject();
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
                    body: Body | BodyType = '',
                    headers = {}): Req {
    return new Req(method, uri, body, headers);
}