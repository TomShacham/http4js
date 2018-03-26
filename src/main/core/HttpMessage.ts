import {Body} from "./Body";
import {Uri} from "./Uri";
import {Response} from "./Response";

export class Header {
    name: string;
    value: string;

    constructor(name: string, value: string) {
        this.name = name;
        this.value = value;
        return this;
    }
}

export interface HttpMessage {
    headers: Array<Header>;
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