import {Body} from "./Body";
import {Uri} from "./Uri";
import {Response} from "./Response";

export interface HttpMessage {
    headers: object;
    body: Body;
    uri: Uri;

    header(name: string): string;

    withHeader(name: string, value: string): HttpMessage;

    replaceHeader(name: string, value: string): HttpMessage

    removeHeader(name: string): HttpMessage

    withBody(body: Body): HttpMessage

    bodyString(): string

}

export type HttpHandler = (Request) => Promise<Response>
