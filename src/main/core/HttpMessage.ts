import {Headers} from "./Headers";
import {Body} from "./Body";

export interface HttpMessage {
    headers: object;
    method: string;
    body: Body;
    uri: string;

    setUri(uri: string): HttpMessage

    getHeader(name: string): string;

    setHeader(name: string, value: string): HttpMessage;

    replaceHeader(name: string, value: string): HttpMessage

    removeHeader(name: string): HttpMessage

    setBody(body: Body): HttpMessage

    setBodystring(body: string): HttpMessage

    bodystring(): string

}

export type HttpHandler = (Request) => Response

export enum Method {
    GET,
    POST
}

export interface Http4jsRequest extends HttpMessage  {
    method: string
}

export interface Response extends HttpMessage {}
