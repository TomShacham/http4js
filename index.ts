export * from "./dist/main/core/RoutingHttpHandler";
export * from "./dist/main/core/Request";
export * from "./dist/main/core/Response";
export * from "./dist/main/core/Server";
export * from "./dist/main/core/Client";
export * from "./dist/main/core/Body";
export * from "./dist/main/core/Uri";


import {Request} from "./dist/main/core/Request";
import {HttpHandler} from "./dist/main/core/HttpMessage";
import {routes} from "./dist/main/core/RoutingHttpHandler";
import {Response} from "./dist/main/core/Response";
import {HttpClient} from "./dist/main/core/Client";
import {Body} from "./dist/main/core/Body";
import {Uri} from "./dist/main/core/Uri";

let handler = (req: Request) => {
    let bodyString = `<h1>${req.method} to ${req.uri.href} with headers ${Object.keys(req.headers)}</h1>`;
    return new Promise(resolve => resolve(new Response(200, new Body(Buffer.from(bodyString)))));
};

let headerFilter = (handler: HttpHandler) => {
    return (req: Request) => {
        return handler(req.setHeader("filter", "1"));
    }
};

let moreRoutes = routes("/bob/{id}", "POST", (req) => {
    return new Promise(resolve => resolve(new Response(201, new Body("created a " + req.path))));
});

routes("/path", "GET", handler)
    .withHandler("/tom", "HEAD", handler)
    .withRoutes(moreRoutes)
    .withFilter(headerFilter)
    .asServer(3000)
    .start();


HttpClient(
    new Request("HEAD", Uri.of("http://localhost:3000/path/tom"))
).then(response => {
    console.log(response.bodyString())
});
