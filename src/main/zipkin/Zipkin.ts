import {HeadersType} from "../core/HttpMessage";
export enum ZipkinHeaders {
    PARENT_ID = 'x-b3-parentspanid',
    SPAN_ID = 'x-b3-spanid',
    TRACE_ID = 'x-b3-traceid',
    SAMPLED = 'x-b3-sampled',
    DEBUG = 'x-b3-debug',
}

export interface IdGenerator {
    newId(): string
}

export class DeterministicIdGenerator implements IdGenerator {
    private counter: number = 0;

    newId(): string {
        const counter = this.counter;
        this.counter += 1;
        return counter.toString();
    }
}

export class ZipkinIdGenerator implements IdGenerator {
    newId(): string {
        return Math.random().toString();
    }
}

export type ParentSpanId = string;
export type SpanId = string;
export type TraceId = string;
export type Sampled = string;
export type Debug = string;

export function zipkinHeadersBuilder(generator: IdGenerator) {
    return (headers: HeadersType) => {
        const zipkinHeaders: HeadersType = {};
        if (headers[ZipkinHeaders.PARENT_ID]) zipkinHeaders[ZipkinHeaders.PARENT_ID] = headers[ZipkinHeaders.PARENT_ID];
        if (headers[ZipkinHeaders.SPAN_ID]) zipkinHeaders[ZipkinHeaders.SPAN_ID] = headers[ZipkinHeaders.SPAN_ID];
        if (headers[ZipkinHeaders.TRACE_ID]) zipkinHeaders[ZipkinHeaders.TRACE_ID] = headers[ZipkinHeaders.TRACE_ID];
        if (headers[ZipkinHeaders.SAMPLED]) zipkinHeaders[ZipkinHeaders.SAMPLED] = headers[ZipkinHeaders.SAMPLED];
        if (headers[ZipkinHeaders.DEBUG]) zipkinHeaders[ZipkinHeaders.DEBUG] = headers[ZipkinHeaders.DEBUG];
        return zipkinHeaders;
    }
}

export const zipkinHeadersFrom = zipkinHeadersBuilder(new ZipkinIdGenerator());