export interface HttpMessage {
    headers: Headers;
    method: string;
    body: string;
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

export interface Router {
    match(request: Request): Response
}


export interface Filter {
    invoke(fn: (HttpHandler) => HttpHandler): (HttpHandler) => Filter //takes "next" httpHandler and applies it after fn
    then(filter: Filter): Filter
}


export enum Method {
    GET = "GET", POST = "POST"
}

export class Headers {}

export interface Request extends HttpMessage  {
    method: string
}

export interface Response extends HttpMessage {}
