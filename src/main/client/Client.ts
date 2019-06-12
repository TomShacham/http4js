import {BodyContent, Handler, HeadersJson, HttpHandler} from '../core/HttpMessage';
import {Req} from "../core/Req";
import {HttpClient} from "./HttpClient";
import {ZipkinHeaders} from "../zipkin/Zipkin";
import {Headers} from "../core/Headers";
import {Body} from "../core/Body";
import {Uri} from "../core/Uri";
import {asHandler, Filters} from '..';


export interface ReqOptions {
    method: string;
    uri: Uri | string;
    body?: Body | BodyContent;
    headers?: Headers | HeadersJson;
}

export class Client {

    static withHeaders(headers: HeadersJson): HttpHandler {
        return (req: Req) => HttpClient(req.withHeaders(headers));
    }

    static zipkinClientFrom(incomingReq: Req): HttpHandler {
        return (req: Req) => HttpClient(
            req.replaceHeader(ZipkinHeaders.PARENT_ID, incomingReq.header(ZipkinHeaders.SPAN_ID))
                .replaceHeader(ZipkinHeaders.TRACE_ID, incomingReq.header(ZipkinHeaders.TRACE_ID))
        );
    }

    static gzip(): Handler {
        return Filters.GZIP(asHandler(HttpClient))
    }
}