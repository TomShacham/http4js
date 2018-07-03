import {Req} from "./Req";
import {HttpHandler, HeadersType} from "./HttpMessage";
import {Redirect, Res} from "./Res";
import {ZipkinIdGenerator, IdGenerator, ZipkinHeaders} from "../zipkin/Zipkin";

export type Filter = (HttpHandler: HttpHandler) => HttpHandler

export class Filters {
    static UPGRADE_TO_HTTPS: Filter = (handler: HttpHandler) => async (req: Req) => {
        if (req.header('x-forwarded-proto') !== 'https') {
            return Redirect(301, `https://${req.uri.hostname()}:${req.uri.port()}${req.uri.path()}`)
        } else {
            return handler(req);
        }
    };

    static TIMING: Filter = (handler: HttpHandler) => async (req: Req) => {
        const start = Date.now();
        const response = await handler(req.withHeader('Start-Time', start.toString()));
        const end = Date.now();
        const total = end - start;
        return response
            .withHeader("Total-Time", total.toString())
            .withHeader("Start-Time", start.toString())
            .withHeader("End-Time", end.toString());
    };

    static DEBUG: Filter = debugFilterBuilder(console);

    static ZIPKIN: Filter = zipkinFilterBuilder(new ZipkinIdGenerator());

    static TIMED_ZIPKIN: Filter = timedZipkinFilterBuilder();

}

const timing = Filters.TIMING;

export function timedZipkinFilterBuilder(timingFilter: Filter = timing): Filter {
    return (httpHandler: HttpHandler) => {
        return timingFilter(zipkinFilterBuilder(new ZipkinIdGenerator())(httpHandler))

    }
}

export function zipkinFilterBuilder(generator: IdGenerator): Filter {
    return (handler: HttpHandler) => async (req: Req) => {
        const debug = req.header(ZipkinHeaders.DEBUG);
        const sampled = req.header(ZipkinHeaders.SAMPLED);
        const isTopLevelRequest = req.header(ZipkinHeaders.PARENT_ID) === undefined;
        const zipkinHeaders: HeadersType = {
            [ZipkinHeaders.PARENT_ID]: req.header(ZipkinHeaders.PARENT_ID) || generator.newId(),
            [ZipkinHeaders.SPAN_ID]: req.header(ZipkinHeaders.SPAN_ID) || generator.newId(),
            [ZipkinHeaders.TRACE_ID]: req.header(ZipkinHeaders.TRACE_ID) || generator.newId(),
        };
        const reqWithZipkinHeaders = req
            .replaceHeader(ZipkinHeaders.PARENT_ID, zipkinHeaders[ZipkinHeaders.PARENT_ID])
            .replaceHeader(ZipkinHeaders.SPAN_ID, zipkinHeaders[ZipkinHeaders.SPAN_ID])
            .replaceHeader(ZipkinHeaders.TRACE_ID, zipkinHeaders[ZipkinHeaders.TRACE_ID]);
        const response = await handler(reqWithZipkinHeaders);
        if (debug !== undefined && !debug && sampled === '0') return response;
        return Object.keys(zipkinHeaders).reduce((finalResponse: Res, headerKey: string) => {
            if (zipkinHeaders[headerKey]) {
                if (headerKey === ZipkinHeaders.PARENT_ID && isTopLevelRequest) {
                    return finalResponse;
                } else {
                    return finalResponse.withHeader(headerKey, zipkinHeaders[headerKey])
                }
            } else {
                return finalResponse
            }
        } , response)
    }
}


export function debugFilterBuilder(out: any): Filter {
    return (handler: HttpHandler) => (req: Req) => {
        const response = handler(req);
        return response.then(response => {
            out.log(`${req.method} to ${req.uri.asUriString()} with response ${response.status}`);
            return response;
        });
    }
}