import {HeadersType, HttpHandler} from "../core/HttpMessage";
import {Req} from "../core/Req";
import {HttpClient} from "./HttpClient";
import {ZipkinHeaders} from "../zipkin/Zipkin";

export class Client {

    static withHeaders(headers: HeadersType): HttpHandler {
        return (req: Req) => HttpClient(
            Object.keys(headers).reduce((_: any, headerKey: string) => (
                req.withHeader(headerKey, headers[headerKey])
            ), req)
        );
    }

    static zipkinClientFrom(incomingReq: Req): HttpHandler {
        return (req: Req) => HttpClient(
            req.replaceHeader(ZipkinHeaders.PARENT_ID, incomingReq.header(ZipkinHeaders.SPAN_ID))
                .withHeader(ZipkinHeaders.TRACE_ID, incomingReq.header(ZipkinHeaders.TRACE_ID))
        );
    }
}