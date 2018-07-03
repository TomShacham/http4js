import {HeadersType, HttpHandler} from "../core/HttpMessage";
import {Req} from "../core/Req";
import {HttpClient} from "./HttpClient";
import {ZipkinHeaders} from "../zipkin/Zipkin";
import {IdGenerator} from "../zipkin/Zipkin";
import {ZipkinIdGenerator} from "../zipkin/Zipkin";
import {TraceId} from "../zipkin/Zipkin";
import {SpanId} from "../zipkin/Zipkin";

export class Client {

    static withHeaders(headers: HeadersType): HttpHandler {
        return (req: Req) => HttpClient(
            Object.keys(headers).reduce((_: any, headerKey: string) => (
                req.withHeader(headerKey, headers[headerKey])
            ), req)
        );
    }

    static withZipkinHeaders(traceId: TraceId, spanId: SpanId): HttpHandler {
        return (req: Req) => HttpClient(
            req.replaceHeader(ZipkinHeaders.PARENT_ID, spanId)
                .withHeader(ZipkinHeaders.TRACE_ID, traceId)
        );
    }
}