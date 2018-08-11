import {HeadersType, HttpHandler} from "../../http4js-core/src/core/HttpMessage";
import {Req} from "../../http4js-core/src/core/Req";
import {HttpClient} from "./HttpClient";
import {ZipkinHeaders} from "../../http4js-zipkin/src/Zipkin";

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
                .replaceHeader(ZipkinHeaders.TRACE_ID, incomingReq.header(ZipkinHeaders.TRACE_ID))
        );
    }
}