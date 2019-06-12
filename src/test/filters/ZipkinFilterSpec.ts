import {asHandler, get} from '../../main/core/Routing';
import {Filter, zipkinFilterBuilder} from '../../main/core/Filters';
import {deepEqual, equal} from 'assert';
import {ResOf} from '../../main/core/Res';
import {Req, ReqOf} from '../../main/core/Req';
import {HttpClient} from '../../main/client/HttpClient';
import {Client} from '../../main/client/Client';
import {ZipkinCollector, ZipkinHeaders, ZipkinSpan} from '../../main/zipkin/Zipkin';
import {isNullOrUndefined} from 'util';
import {Handler, timingFilterBuilder} from '../../main';
import {FakeClock} from '../clock/FakeClock';
import {DeterministicIdGenerator} from './DeterministicIdGenerator';
import {HttpServer} from '../../main/servers/NativeServer';

const upstream1BaseUrl = 'http://localhost:3032';
const upstream2BaseUrl = 'http://localhost:3033';
const moreUpstreamBaseUrl = 'http://localhost:3034';

const logLines: string[] = [];
const deterministicZipkinFilter = zipkinFilterBuilder(new DeterministicIdGenerator());

const loggingFilter: Filter = (handler: Handler) => asHandler(async(req: Req) => {
    const res = await handler.handle(req);
    const parentId = res.header(ZipkinHeaders.PARENT_ID);
    const spanId = res.header(ZipkinHeaders.SPAN_ID);
    const traceId = res.header(ZipkinHeaders.TRACE_ID);
    const startTime = res.header('start-time');
    const endTime = res.header('end-time');
    const line = `${parentId ? parentId : ''};${spanId};${traceId};${startTime};${endTime}`;
    logLines.push(line);
    return res;
});

const fakeClock = new FakeClock();
const deterministicTimingFilter: Filter = timingFilterBuilder(fakeClock);

const topLevelRequestRoutes = get('/', async(req: Req) => {
    const parentZipkinClient = Client.zipkinClientFrom(req);
    const upstreamResponse1 = await parentZipkinClient(ReqOf('GET', `${upstream1BaseUrl}/`));
    const upstreamResponse2 = await parentZipkinClient(ReqOf('GET', `${upstream2BaseUrl}/`));
    const moreUpstreamResponse = JSON.parse(upstreamResponse2.bodyString());
    return ResOf(200, JSON.stringify({
        upstream1: upstreamResponse1.headers,
        upstream2: upstreamResponse2.headers,
        moreUpstream: moreUpstreamResponse
    }));
})
    .withFilter(deterministicZipkinFilter)
    .withFilter(deterministicTimingFilter)
    .withFilter(loggingFilter)
    .asServer(HttpServer(3031));

const upstream1 = get('/', async() => ResOf())
    .withFilter(deterministicZipkinFilter)
    .withFilter(deterministicTimingFilter)
    .withFilter(loggingFilter)
    .asServer(HttpServer(3032));

const upstream2 = get('/', async(req: Req) => {
    const upstreamZipkinClient = Client.zipkinClientFrom(req);
    const moreUpstreamResponse = await upstreamZipkinClient(ReqOf('GET', `${moreUpstreamBaseUrl}/`));
    return ResOf(200, JSON.stringify(moreUpstreamResponse.headers));
})
    .withFilter(deterministicZipkinFilter)
    .withFilter(deterministicTimingFilter)
    .withFilter(loggingFilter)
    .asServer(HttpServer(3033));

const moreUpstream = get('/', async() => ResOf())
    .withFilter(deterministicZipkinFilter)
    .withFilter(deterministicTimingFilter)
    .withFilter(loggingFilter)
    .asServer(HttpServer(3034));

describe('Zipkin', () => {

    before(() => {
        topLevelRequestRoutes.start();
        upstream1.start();
        upstream2.start();
        moreUpstream.start();
    });

    after(() => {
        topLevelRequestRoutes.stop();
        upstream1.stop();
        upstream2.stop();
        moreUpstream.stop();
    });

    it('tracing multiple upstream servers', async() => {
        const responseFromParent = await HttpClient(ReqOf('GET', 'http://localhost:3031/'));
        const upstreamHeaders = JSON.parse(responseFromParent.bodyString());

        const responseHeaders = {
            parent: responseFromParent.headers,
            ...upstreamHeaders
        };

        // parent span ids
        equal(responseHeaders.parent['x-b3-parentspanid'], undefined);
        equal(responseHeaders.upstream1['x-b3-parentspanid'], '1');
        equal(responseHeaders.upstream2['x-b3-parentspanid'], '1');
        equal(responseHeaders.moreUpstream['x-b3-parentspanid'], '4');

        // span id is different
        equal(responseHeaders.parent['x-b3-spanid'], '1');
        equal(responseHeaders.upstream1['x-b3-spanid'], '3');
        equal(responseHeaders.upstream2['x-b3-spanid'], '4');
        equal(responseHeaders.moreUpstream['x-b3-spanid'], '5');

        // trace id is maintained
        equal(responseHeaders.parent['x-b3-traceid'], '2');
        equal(responseHeaders.upstream1['x-b3-traceid'], '2');
        equal(responseHeaders.upstream2['x-b3-traceid'], '2');
        equal(responseHeaders.moreUpstream['x-b3-traceid'], '2');
    });

    it('timed zipkin filter', async() => {
        const response = await get('/', async() => ResOf())
            .withFilter(deterministicZipkinFilter)
            .withFilter(deterministicTimingFilter)
            .serve(ReqOf('GET', '/'));
        equal(response.header('x-b3-spanid'), 7);
        equal(response.header('x-b3-traceid'), 8);
        equal(!isNullOrUndefined(response.header('start-time')), true);
        equal(!isNullOrUndefined(response.header('end-time')), true);
    });

    it('collect log lines into a tree description of trace', async() => {
        const traceId = 2;
        const moreUpstream = {parentId: 4, spanId: 5, traceId: traceId, start: 5, end: 6, timeTaken: 1, children: []};
        const upstreamB = {
            parentId: 1,
            spanId: 4,
            traceId: traceId,
            start: 4,
            end: 7,
            timeTaken: 3,
            children: [moreUpstream]
        };
        const upstreamA = {parentId: 1, spanId: 3, traceId: traceId, start: 2, end: 3, timeTaken: 1, children: []};
        const topLevel = {
            parentId: undefined,
            spanId: 1,
            traceId: traceId,
            start: 1,
            end: 8,
            timeTaken: 7,
            children: [upstreamA, upstreamB]
        };
        deepEqual(ZipkinCollector(logLines, extractor), topLevel)
    });

});

function extractor(logLine: string): ZipkinSpan {
    const logLineZipkinParts = logLine.split(';');
    const parentId = logLineZipkinParts[0];
    return {
        parentId: parentId ? +parentId : undefined,
        spanId: +logLineZipkinParts[1],
        traceId: +logLineZipkinParts[2],
        start: +logLineZipkinParts[3],
        end: +logLineZipkinParts[4],
        timeTaken: +logLineZipkinParts[4] - +logLineZipkinParts[3],
        children: [],
    };
}
