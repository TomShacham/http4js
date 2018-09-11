import {Req} from "./Req";
import {HttpHandler, HeadersType} from "./HttpMessage";
import {Res} from "./Res";
import {ZipkinIdGenerator, IdGenerator, ZipkinHeaders} from "../zipkin/Zipkin";
import {Clock} from "./Clock";

export type Filter = (HttpHandler: HttpHandler) => HttpHandler

export class Filters {
    static UPGRADE_TO_HTTPS: Filter = (handler: HttpHandler) => async (req: Req) => {
        if (req.header('x-forwarded-proto') !== 'https') {
            return Res.Redirect(301, `https://${req.uri.hostname()}:${req.uri.port()}${req.uri.path()}`)
        } else {
            return handler(req);
        }
    };

    static TIMING: Filter = (handler: HttpHandler) => async (req: Req) => {
        const start = Date.now();
        const response = await handler(req);
        const end = Date.now();
        const total = end - start;
        return response
            .withHeader("Total-Time", total.toString())
            .withHeader("Start-Time", start.toString())
            .withHeader("End-Time", end.toString());
    };

    static DEBUG: Filter = debugFilterBuilder(console);

    static ZIPKIN: Filter = zipkinFilterBuilder(new ZipkinIdGenerator());

}

export function zipkinFilterBuilder(generator: IdGenerator): Filter {
    return (handler: HttpHandler) => async (req: Req) => {
        const debug = req.header(ZipkinHeaders.DEBUG);
        const sampled = req.header(ZipkinHeaders.SAMPLED);
        const isTopLevelRequest = req.header(ZipkinHeaders.PARENT_ID) === undefined;
        const zipkinHeaders: HeadersType = {
            [ZipkinHeaders.PARENT_ID]: req.header(ZipkinHeaders.PARENT_ID) || generator.newId(16),
            [ZipkinHeaders.SPAN_ID]: req.header(ZipkinHeaders.SPAN_ID) || generator.newId(16),
            [ZipkinHeaders.TRACE_ID]: req.header(ZipkinHeaders.TRACE_ID) || generator.newId(32),
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

export function timingFilterBuilder(clock: Clock): Filter {
    return (handler: HttpHandler) => async (req: Req) => {
        const start = clock.now();
        const response = await handler(req);
        const end = clock.now();
        const total = end - start;
        return response
            .withHeader("Total-Time", total.toString())
            .withHeader("Start-Time", start.toString())
            .withHeader("End-Time", end.toString());
    };

}

const defaultMessageFrom = (req: Req, res: Res) => (`${req.method} to ${req.uri.asUriString()} gave status ${res.status}` +
    ` with headers ${JSON.stringify(res.headers)}`);

export function debugFilterBuilder(out: any, messageFrom: (req: Req, res: Res)=>string = (req, res)=> defaultMessageFrom(req, res)): Filter {
    return (handler: HttpHandler) => async (req: Req) => {
        const res = await handler(req);
        out.log(messageFrom(req, res));
        return res;
    }
}