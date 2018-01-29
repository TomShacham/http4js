import {Headers} from "./Headers";
import {Body} from "./Body";

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

    setBody(body: Body): HttpMessage

    setBodystring(body: string): HttpMessage

    headerValues(name: string): string[];

    bodystring(): string

}

export type HttpHandler = (Request) => Response

export enum Method {
    GET = "GET",
    POST = "POST"
}

export interface Http4jsRequest extends HttpMessage  {
    method: string
}

export interface Response extends HttpMessage {}
