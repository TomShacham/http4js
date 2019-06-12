import {Req} from "./Req";
import {Handler, HeadersJson, HttpHandler} from './HttpMessage';
import {Res} from "./Res";
import {IdGenerator, ZipkinHeaders, ZipkinIdGenerator} from "../zipkin/Zipkin";
import {Clock} from "./Clock";
import {Headers} from "./Headers";
import * as zlib from "zlib";
import {asHandler} from './Routing';

export type Filter = (handler: Handler | HttpHandler) => Handler

export class Filters {
    static UPGRADE_TO_HTTPS: Filter = (handler: Handler | HttpHandler) => asHandler(async (req: Req) => {
        if (req.header('x-forwarded-proto') !== 'https') {
            return Res.Redirect(301, `https://${req.uri.hostname()}:${req.uri.port()}${req.uri.path()}`)
        } else {
            return asHandler(handler).handle(req);
        }
    });

    static TIMING: Filter = timingFilterBuilder(Date);

    static DEBUG: Filter = debugFilterBuilder(console);

    static ZIPKIN: Filter = zipkinFilterBuilder(new ZipkinIdGenerator());

    static GZIP: Filter = (handler: Handler | HttpHandler) => asHandler(async (req: Req) => {
          if (req.header(Headers.CONTENT_ENCODING) === 'gzip') {
            const body = req.bodyStream()!.pipe(zlib.createGunzip());
            return await asHandler(handler).handle(req.withBody(body));
          } else {
            return await asHandler(handler).handle(req);
          }
        })

}

export function zipkinFilterBuilder(generator: IdGenerator): Filter {
    return (handler: Handler | HttpHandler) => asHandler(async (req: Req) => {
        const debug = req.header(ZipkinHeaders.DEBUG);
        const sampled = req.header(ZipkinHeaders.SAMPLED);
        const isTopLevelRequest = req.header(ZipkinHeaders.PARENT_ID) === undefined;
        const zipkinHeaders: HeadersJson = {
            [ZipkinHeaders.PARENT_ID]: req.header(ZipkinHeaders.PARENT_ID) || generator.newId(16),
            [ZipkinHeaders.SPAN_ID]: req.header(ZipkinHeaders.SPAN_ID) || generator.newId(16),
            [ZipkinHeaders.TRACE_ID]: req.header(ZipkinHeaders.TRACE_ID) || generator.newId(32),
        };
        const reqWithZipkinHeaders = req
            .replaceHeader(ZipkinHeaders.PARENT_ID, zipkinHeaders[ZipkinHeaders.PARENT_ID])
            .replaceHeader(ZipkinHeaders.SPAN_ID, zipkinHeaders[ZipkinHeaders.SPAN_ID])
            .replaceHeader(ZipkinHeaders.TRACE_ID, zipkinHeaders[ZipkinHeaders.TRACE_ID]);
        const response = await asHandler(handler).handle(reqWithZipkinHeaders);
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
    });
}

export function timingFilterBuilder(clock: Clock): Filter {
    return (handler: Handler | HttpHandler) => asHandler(async (req: Req) => {
        const start = clock.now();
        const response = await asHandler(handler).handle(req);
        const end = clock.now();
        const total = end - start;
        return response
            .withHeader("Total-Time", total.toString())
            .withHeader("Start-Time", start.toString())
            .withHeader("End-Time", end.toString());
    });

}

const defaultMessageFrom = (req: Req, res: Res) => (`${req.method} to ${req.uri.asUriString()} gave status ${res.status}` +
    ` with headers ${JSON.stringify(res.headers)}`);

export function debugFilterBuilder(out: any, messageFrom: (req: Req, res: Res)=>string = (req, res)=> defaultMessageFrom(req, res)): Filter {
    return (handler: Handler | HttpHandler) => asHandler(async (req: Req) => {
        const res = await asHandler(handler).handle(req);
        out.log(messageFrom(req, res));
        return res;
    })
}