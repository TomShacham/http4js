import {Res} from "./Res";
import {Req} from "./Req";
import {Body} from "./Body";
import {Readable} from "stream";

export type KeyValues = {[key:string]: string};
export type PathParams = {[key:string]: string}
export type QueryField = string|string[];
export type Queries = {[key:string]: QueryField};
export type FormField = string|string[];
export type FormJson = {[key:string]: FormField};
export type HeadersJson = {[key:string]: string};
export type BodyContent = Readable | string;


export interface HttpMessage {
    headers: HeadersJson;
    body: Body;

    header(name: string): string;
    withHeader(name: string, value: string): HttpMessage;
    replaceHeader(name: string, value: string): HttpMessage
    replaceAllHeaders(headers: HeadersJson): HttpMessage
    removeHeader(name: string): HttpMessage
    withBody(body: string): HttpMessage
    bodyString(): string

}

export type HttpHandler = (request: Req) => Promise<Res>
