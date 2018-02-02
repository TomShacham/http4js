import {Body} from "./Body";
import {Uri} from "./Uri";

export interface HttpMessage {
    headers: object;
    method: string;
    body: Body;
    uri: Uri;

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
