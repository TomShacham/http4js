import {Body} from "./Body";
import {Uri} from "./Uri";
import {Response} from "./Response";

export declare enum Header {
    CONTENT_TYPE = "Content-Type",
    APPLICATION_JSON = "application/json"
}

export interface HttpMessage {
    headers: object;
    body: Body;
    uri: Uri;

    getHeader(name: string): string;

    setHeader(name: string, value: string): HttpMessage;

    replaceHeader(name: string, value: string): HttpMessage

    removeHeader(name: string): HttpMessage

    setBody(body: Body): HttpMessage

    setBodystring(body: string): HttpMessage

    bodyString(): string

}

export type HttpHandler = (Request) => Promise<Response>

export type Filter = (HttpHandler: HttpHandler) => HttpHandler