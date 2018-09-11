import {Res} from "./Res";
import {Req} from "./Req";
import {Body} from "./Body";
import {Readable} from "stream";

export type KeyValues = {[key:string]: string};
export type FormField = string|string[];
export type FormType = {[key:string]: FormField};
export type HeadersType = {[key:string]: string};
export type BodyType = Readable | string;


export interface HttpMessage {
    headers: HeadersType;
    body: Body;

    header(name: string): string;
    withHeader(name: string, value: string): HttpMessage;
    replaceHeader(name: string, value: string): HttpMessage
    replaceAllHeaders(headers: HeadersType): HttpMessage
    removeHeader(name: string): HttpMessage
    withBody(body: string): HttpMessage
    bodyString(): string

}

export type HttpHandler = (request: Req) => Promise<Res>
