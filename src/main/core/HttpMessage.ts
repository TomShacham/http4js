export interface HttpMessage {
    headers: Headers;
    method: string;
    body: Body;
    uri: string;

    setUri(uri: string): HttpMessage

    getHeader(name: string): string;

    setHeader(name: string, value: string): HttpMessage;

    allHeaders(headers: Headers): HttpMessage

    replaceHeader(name: string, value: string): HttpMessage

    removeHeader(name: string): HttpMessage

    setBody(body: string): HttpMessage

    setBodystring(body: string): HttpMessage

    headerValues(name: string): string[];

    bodystring(): string

}

export type HttpHandler = (Request) => Response

export class Body {
    public bytes;
    public asString;

    constructor (bytes: Buffer | string) {
        if (typeof bytes == "string") {
            this.asString = bytes;
        } else {
            this.bytes = bytes;
        }
    }

    toString() {
        return this.bytes.toString()
    }
}

export enum Method {
    GET = "GET",
    POST = "POST"
}

export class Headers {}

export interface Request extends HttpMessage  {
    method: string
}

export interface Response extends HttpMessage {}
