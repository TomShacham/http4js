import {getTo, routes} from "./src/main/core/RoutingHttpHandler";
import {HttpClient} from "./src/main/core/Client";
import {Request} from "./src/main/core/Request";
import {Response} from "./src/main/core/Response";
import {NativeServer} from "./src/main/core/NativeServer";
export * from "./dist/main/core/RoutingHttpHandler";
export * from "./dist/main/core/Request";
export * from "./dist/main/core/Response";
export * from "./dist/main/core/Server";
export * from "./dist/main/core/Client";
export * from "./dist/main/core/Body";
export * from "./dist/main/core/Uri";

const upstream = routes(".*", ".*", (req: Request) => {
    let response = new Response(200, req.headers);
    console.log("*** UPSTREAM RESPONSE ***");
    console.log(response);
    return Promise.resolve(response);
})
    .asServer(new NativeServer(3001))
    .start();

const proxy = routes(".*", ".*", (req: Request) => {
    let rewrittenRequest = req.setUri("http://localhost:3001/")
        .setHeader("x-proxy", "header from proxy")
        .setHeader("host", req.uri.href);
    console.log("*** REWRITTEN REQUEST ***");
    console.log(rewrittenRequest);
    return HttpClient(rewrittenRequest);
})
    .asServer()
    .start();
