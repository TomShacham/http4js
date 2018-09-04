# http4js

### Table of Contents

- [Overview](/http4js/#basics)
- [Handlers and Filters](/http4js/Handlers-and-filters/#handlers-and-filters)
- [Request and Response API](/http4js/Request-and-response-api/#request-and-response-api)
- [URI API](/http4js/Uri-api/#uri-api)
- [Routing API](/http4js/Routing-api/#routing-api)
- [In Memory Testing](/http4js/In-memory-testing/#in-memory-testing)
- [End to End Testing](/http4js/End-to-end-testing/#end-to-end-testing)
- [Approval testing with fakes](/http4js/Approval-testing-with-fakes/#approval-testing-with-fakes)
- [Zipkin tracing](/http4js/Zipkin-tracing/#zipkin-tracing)
- [Https Server](/http4js/Https-server/#https-server)
- [Proxy](/http4js/Proxy/#proxy)
- [Use in Javascript](/http4js/Use-in-javascript/#how-to-require-and-use-http4js-in-js)
- [Example App](https://github.com/TomShacham/http4js-eg)

# Zipkin tracing

Zipkin is a standard for microservices that want to expose a graph of requests sent between them. 

Each service sets some headers on their response based on the values already set for those headers on the incoming request. 

A clearer explanation can be found [here](https://github.com/openzipkin/b3-propagation).

## Use in http4js

We provide a filter on the server `Filters.ZIPKIN` and a client `Client.withZipkinHeaders(req)`. The two work together
to add the correct headers to outbound requests. 

Upstream servers need only add the `Filters.ZIPKIN` filter and the `Filters.TIMING` filter to their routes.
 
```typescript
get('/', async(req) => ResOf(200, JSON.stringify(req.headers)))
    .withFilter(Filters.ZIPKIN)
    .withFilter(Filters.TIMING)
```

However, clients will need to do something a bit special. This is because outbound zipkin request headers need to be
generated based on incoming request headers. 

```typescript
get('/', async(req) => {
    const clientWithZipkinHeaders = Client.zipkinClientFrom(req);
    const upstream = await clientWithZipkinHeaders(ReqOf('GET', 'http://localhost:3001/'));
    return ResOf(200, JSON.stringify(upstream.headers));
})
```

This process could be hidden away, by either having a zipkin client put on the incoming req e.g. `const client = req.zipkinClient`
or by placing the incoming zipkin request headers in some global state e.g. thread-local storage, so that clients can
reach in and get the zipkin header values they need to make outbound requests with the correct zipkin headers. This is a
bit dirty and difficult to achieve in Nodejs.

## Collection

If your apps log zipkin headers to a central place, we can look back and build a trace by grouping logs together
based on `traceId` and using `parentId` to create a tree structure representing the entire trace dependency graph.

We provide a basic collection function should you want to use it. Given an array of strings and an `extractor`, a function
from a `string` to a `ZipkinSpan`, then it spits out a `ZipkinSpan` whose children and children's children and so on shall
be in the correct tree structure representing the requests and responses of the trace.

```typescript
function ZipkinCollector(logLines: string[], extractor: (logLine: string) => ZipkinSpan): ZipkinSpan {
    const zipkinSpans = logLines.reduce((spans: ZipkinSpan[], line: string) => {
        const zipkinSpan = extractor(line);
        spans.push(zipkinSpan);
        return spans;
    }, []);
    const topLevelRequest = zipkinSpans.find(it => !it.parentId);
    return treeStructure(topLevelRequest!, zipkinSpans);

    function treeStructure(root: ZipkinSpan, spans: ZipkinSpan[]): ZipkinSpan {
        const children = spans.filter(it => it.parentId === root.spanId);
        root.children = children.map(child => treeStructure(child, spans));
        return root;
    }
}
```

It assumes the `logLines` are for one `trace`, so to reduce over many traces you will need to write something like this:

```typescript
function reduceLogsToTraces(allLogs: string[], extractTraceId: (line: string) => string) {
    const groupedByTraceId = allLogs.reduce((traces, line) => {
        if (traces[extractTraceId(line)] !== undefined) {
            traces[extractTraceId(line)] = traces[extractTraceId(line)].push(line)
        } else {
            traces[extractTraceId(line)] = [line]
        }
    }, {});
    Object.keys(groupedByTraceId).reduce((zipkinTraces, traceId) => {
        zipkinTraces.push(ZipkinCollector(groupedByTraceId[traceId], extractor));
        return zipkinTraces;
    }, []);
        
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
}
```
  
## Example

Below is an example of one server with a route that makes a client call to another server. Our client sets the correct
zipkin headers by looking at the incoming req `const client = Client.zipkinClientFrom(req);`.

We use a custom debug filter, that appends its output to `logLines` in basic semi-colon delimited strings representing
the information we care about: `parentSpanId`, `spanId`, `traceId`, `startTime` and `endTime`.

```typescript
debugFilterBuilder({log: (line)=>logLines.push(line)}, (req, res) => (
        `${res.header('x-b3-parentspanid')};${res.header('x-b3-spanid')};${res.header('x-b3-traceid')};` +
        `${res.header('start-time')};${res.header('end-time')} || `
    )
)
```

We have another route at `/log` which dumps our `loglines` into the browser and has a submit box that will go through
the log lines and build a trace visualisation given a `traceId`.

```typescript
import {get} from "./core/Routing";
import {ResOf} from "./core/Res";
import {Filters, debugFilterBuilder} from "./core/Filters";
import {NativeHttpServer} from "./servers/NativeHttpServer";
import {Client} from "./client/Client";
import {ReqOf} from "./core/Req";

const logLines = [];

// server requesting upstream
get('/', async(req) => {
    const client = Client.zipkinClientFrom(req);
    const upstream = await client(ReqOf('GET', 'http://localhost:3001/'));
    return ResOf(200, JSON.stringify(upstream.headers));
})
    .withGet('/log', async(req)=> {
        const html = `<div id="loglines">${logLines}</div>
<input id="traceId" value="${logLines[0] ? logLines[0].split(';')[2] : 'trace id'}">
<input id="submit" type="submit">
<div id="trace"></div>`;
        return ResOf(200, html + script)
    })
    .withFilter(Filters.ZIPKIN)
    .withFilter(Filters.TIMING)
    .withFilter(debugFilterBuilder({log: (line)=>logLines.push(line)}, (req, res) => (
        `${res.header('x-b3-parentspanid')};${res.header('x-b3-spanid')};${res.header('x-b3-traceid')};` +
        `${res.header('start-time')};${res.header('end-time')} || `
    )))
    .withFilter(Filters.DEBUG)
    .asServer(new NativeHttpServer(3000))
    .start();

// upstream server
get('/', async(req) => ResOf(200, JSON.stringify(req.headers)))
    .withFilter(Filters.ZIPKIN)
    .withFilter(Filters.TIMING)
    .withFilter(debugFilterBuilder({log: (line)=>logLines.push(line)}, (req, res) => (
        `${res.header('x-b3-parentspanid')};${res.header('x-b3-spanid')};${res.header('x-b3-traceid')};` +
        `${res.header('start-time')};${res.header('end-time')} || `
    )))
    .withFilter(Filters.DEBUG)
    .asServer(new NativeHttpServer(3001))
    .start();

const script = `
<script>

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('submit').addEventListener('click', () => {
        const loglines = document.getElementById('loglines').innerText.split(' || ');
        const newTraceId = document.getElementById('traceId').innerText
        document.getElementById('trace').innerHTML = drawHtml(ZipkinCollector(loglines, newTraceId)).outerHTML;
    });   
});

function drawHtml(zipkinTrace) {
    const topLevelRequestStartTime = zipkinTrace.start;

    const orderedSpans = [zipkinTrace].reduce((orderedList, span) => {
        pushChild(span);
        return orderedList;

        function pushChild(span) {
            const child = {start: span.start, end: span.end, spanId: span.spanId, timeTaken: span.timeTaken};
            orderedList.push(child);
            if (span.children.length > 0) span.children.map(child => pushChild(child));
        }
    }, []);

    const topLevelRequest = drawChild(orderedSpans[0]);
    orderedSpans.slice(1).map(span => {
        topLevelRequest.appendChild(drawChild(span));
    });
    return topLevelRequest;

    function drawChild(child) {
        const el = document.createElement('div');
        el.style.backgroundColor = 'lightgreen';
        el.style.flex = 'column';
        el.style.position = 'relative';
        el.style.left = Math.floor(1024 * (child.start - topLevelRequestStartTime) / zipkinTrace.timeTaken) + 'px';
        el.style.width = 1024 * (child.end - child.start) / zipkinTrace.timeTaken + 'px';
        el.style.height = '25px';
        el.innerText = 'start: ' + child.start + ' end: ' + child.end + ' span: ' + child.spanId;
        return el;
    }

}

function ZipkinCollector(allLoglines, traceId) {
    const traceLines = allLoglines.filter(it => it.indexOf(traceId) > -1);
    return collectTrace(traceLines);

    function collectTrace(logLines) {
        const zipkinSpans = logLines.reduce((acc, next) => {
            const logLineZipkinParts = next.split(';');
            const parentId = logLineZipkinParts[0];
            const zipkinSpan = {
                parentId: parentId ? +parentId : undefined,
                spanId: +logLineZipkinParts[1],
                traceId: +logLineZipkinParts[2],
                start: +logLineZipkinParts[3],
                end: +logLineZipkinParts[4],
                timeTaken: +logLineZipkinParts[4] - +logLineZipkinParts[3],
                children: [],
            };
            acc.push(zipkinSpan);
            return acc;
        }, []);
        const topLevelRequest = zipkinSpans.find(it => !it.parentId);
        return treeStructure(topLevelRequest, zipkinSpans);
    }

    function treeStructure(root, spans) {
        const children = spans.filter(it => it.parentId === root.spanId);
        root.children = children.map(child => treeStructure(child, spans));
        return root;
    }
}

</script>
`;
```


Prev: [Approval testing with fakes](/http4js/Approval-testing-with-fakes/#approval-testing-with-fakes)

Next: [Https Server](/http4js/Https-server/#https-server)


