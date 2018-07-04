import {get} from "../../main/core/Routing";
import {zipkinFilterBuilder, Filter} from "../../main/core/Filters";
import {equal} from "assert";
import {ResOf} from "../../main/core/Res";
import {ReqOf, Req} from "../../main/core/Req";
import {NativeHttpServer} from "../../main/servers/NativeHttpServer";
import {HttpClient} from "../../main/client/HttpClient";
import {Client} from "../../main/client/Client";
import {ZipkinHeaders, DeterministicIdGenerator} from "../../main/zipkin/Zipkin";
import {Filters} from "../../main/core/Filters";
import {notEqual} from "assert";
import {isNullOrUndefined} from "util";

const upstream1BaseUrl = 'http://localhost:3032';
const upstream2BaseUrl = 'http://localhost:3033';
const moreUpstreamBaseUrl = 'http://localhost:3034';

const deterministicZipkinFilter = zipkinFilterBuilder(new DeterministicIdGenerator());

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
    .asServer(new NativeHttpServer(3031));

const upstream1 = get('/', async() => ResOf())
    .withFilter(deterministicZipkinFilter)
    .asServer(new NativeHttpServer(3032));

const upstream2 = get('/', async(req: Req) => {
    const upstreamZipkinClient = Client.zipkinClientFrom(req);
    const moreUpstreamResponse = await upstreamZipkinClient(ReqOf('GET', `${moreUpstreamBaseUrl}/`));
    return ResOf(200, JSON.stringify(moreUpstreamResponse.headers));
})
    .withFilter(deterministicZipkinFilter)
    .asServer(new NativeHttpServer(3033));

const moreUpstream = get('/', async() => ResOf())
    .withFilter(deterministicZipkinFilter)
    .asServer(new NativeHttpServer(3034));


describe("Zipkin", () => {

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

    it("tracing multiple upstream servers", async() => {
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
            .withFilter(Filters.TIMING)
            .serve(ReqOf('GET', '/'));
        equal(response.header('x-b3-spanid'), 7);
        equal(response.header('x-b3-traceid'), 8);
        equal(isNullOrUndefined(response.header('start-time')), false);
        equal(isNullOrUndefined(response.header('end-time')), false);
    })

});