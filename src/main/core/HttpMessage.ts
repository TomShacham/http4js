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
