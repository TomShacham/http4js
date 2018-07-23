import {get} from '../../main/core/Routing';
import {Filter, zipkinFilterBuilder} from '../../main/core/Filters';
import {deepEqual, equal} from 'assert';
import {ResOf} from '../../main/core/Res';
import {Req, ReqOf} from '../../main/core/Req';
import {NativeHttpServer} from '../../main/servers/NativeHttpServer';
import {HttpClient} from '../../main/client/HttpClient';
import {Client} from '../../main/client/Client';
import {DeterministicIdGenerator, ZipkinHeaders} from '../../main/zipkin/Zipkin';
import {isNullOrUndefined} from 'util';
import {HttpHandler, timingFilterBuilder} from '../../main';

const upstream1BaseUrl = 'http://localhost:3032';
const upstream2BaseUrl = 'http://localhost:3033';
const moreUpstreamBaseUrl = 'http://localhost:3034';

const logLines: string[] = [];
const deterministicZipkinFilter = zipkinFilterBuilder(new DeterministicIdGenerator());

const loggingFilter: Filter = (handler: HttpHandler) => async (req: Req) => {
    const res = await handler(req);
    const parentId = res.header(ZipkinHeaders.PARENT_ID);
    const spanId = res.header(ZipkinHeaders.SPAN_ID);
    const traceId = res.header(ZipkinHeaders.TRACE_ID);
    const startTime = res.header('start-time');
    const endTime = res.header('end-time');
    const line = `${parentId ? parentId : ''};${spanId};${traceId};${startTime};${endTime}`;
    logLines.push(line);
    return res;
};

class FakeClock {
    private time: number = 0;
    now() {
        this.time += 1;
        return this.time;
    }
}

export interface Clock {
    now(): number
}

const fakeClock = new FakeClock();

const deterministicTimingFilter = timingFilterBuilder(fakeClock);

const parent = get('/', async(req: Req) => {
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
    .asServer(new NativeHttpServer(3031));

const upstream1 = get('/', async() => ResOf())
    .withFilter(deterministicZipkinFilter)
    .withFilter(deterministicTimingFilter)
    .withFilter(loggingFilter)
    .asServer(new NativeHttpServer(3032));

const upstream2 = get('/', async(req: Req) => {
    const upstreamZipkinClient = Client.zipkinClientFrom(req);
    const moreUpstreamResponse = await upstreamZipkinClient(ReqOf('GET', `${moreUpstreamBaseUrl}/`));
    return ResOf(200, JSON.stringify(moreUpstreamResponse.headers));
})
    .withFilter(deterministicZipkinFilter)
    .withFilter(deterministicTimingFilter)
    .withFilter(loggingFilter)
    .asServer(new NativeHttpServer(3033));

const moreUpstream = get('/', async() => ResOf())
    .withFilter(deterministicZipkinFilter)
    .withFilter(deterministicTimingFilter)
    .withFilter(loggingFilter)
    .asServer(new NativeHttpServer(3034));


interface ZipkinTrace {
    parentId: number | undefined,
    spanId: number,
    traceId: number,
    start: number,
    end: number,
    timeTaken: number,
}

function ZipkinCollector(logLines: string[]): ZipkinTrace[] {
    return logLines.reduce((acc: ZipkinTrace[], next: string) => {
        const responseZipkinParts = next.split(';');
        const parentId = responseZipkinParts[0];
        const zipkinTrace = {
            parentId: parentId ? +parentId : undefined,
            spanId: +responseZipkinParts[1],
            traceId: +responseZipkinParts[2],
            start: +responseZipkinParts[3],
            end: +responseZipkinParts[4],
            timeTaken: +responseZipkinParts[4] - +responseZipkinParts[3],
        };
        acc.push(zipkinTrace);
        return acc;
    }, [])
}

describe('Zipkin', () => {

    before(() => {
        parent.start();
        upstream1.start();
        upstream2.start();
        moreUpstream.start();
    });

    after(() => {
        parent.stop();
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

    it('collect log lines into a description of trace', async() => {
        const traceId = 2;
        deepEqual(ZipkinCollector(logLines), [
            { parentId: 1, spanId: 3, traceId: traceId, start: 2, end: 3, timeTaken: 1},
            { parentId: 4, spanId: 5, traceId: traceId, start: 5, end: 6, timeTaken: 1},
            { parentId: 1, spanId: 4, traceId: traceId, start: 4, end: 7, timeTaken: 3},
            { parentId: undefined, spanId: 1, traceId: traceId, start: 1, end: 8, timeTaken: 7},
        ]);
    });

});
