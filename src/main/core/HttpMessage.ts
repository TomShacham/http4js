import {Uri} from "./Uri";
import {Response} from "./Response";

export interface HttpMessage {
    headers: object;
    body: string;
    uri: Uri;

    header(name: string): string;

    withHeader(name: string, value: string): HttpMessage;

    replaceHeader(name: string, value: string): HttpMessage

    removeHeader(name: string): HttpMessage

    withBody(body: string): HttpMessage

    bodyString(): string

}

export type HttpHandler = (Request) => Promise<Response>
