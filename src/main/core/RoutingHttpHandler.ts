import * as http from "http";
import {InMemoryResponse} from "./InMemoryResponse";
import {Response, Request, Body, HttpHandler} from "./HttpMessage";
import {InMemoryRequest} from "./InMemoryRequest";
import {Filter} from "./Filter";

interface Router {
    match(request: Request): Response
}

interface RoutingHttpHandler extends Router {
    withFilter(filter: (HttpHandler) => HttpHandler): RoutingHttpHandler
//     withBasePath(path: String): RoutingHttpHandler
    asServer(port: number): RoutingHttpHandler
}

interface Http4jsServer {
    start(port: number): void
    stop(): void
}

class BasicServer implements Http4jsServer {
    server;

    start(port: number): void {
        let server = http.createServer();
        this.server = server;
        server.listen(port)
    }

    stop(): void {
        this.server.close()
    }

}

export function routes(path: string, fn: (Request) => Response): ResourceRoutingHttpHandler {
    return new ResourceRoutingHttpHandler(path, fn);
}

class ResourceRoutingHttpHandler implements RoutingHttpHandler {

    private path: string;
    private server: Http4jsServer;
    private fn: HttpHandler;

    constructor(path: string, fn: HttpHandler) {
        this.path = path;
        this.fn = fn;
    }

    withFilter(filter: (HttpHandler) => HttpHandler): RoutingHttpHandler {
        return new ResourceRoutingHttpHandler(this.path, filter(this.fn));
    }


    asServer(port: number, server: BasicServer = new BasicServer()): ResourceRoutingHttpHandler {
        this.server = server;
        server.start(port);
        server.server.on("request", req => {
            const {headers, method, url} = req;
            let chunks = [];
            req.on('error', (err) => {
                console.error(err);
            }).on('data', (chunk) => {
                chunks.push(chunk);
            }).on('end', () => {
                let body = new Body(Buffer.concat(chunks));
                let inMemoryRequest = new InMemoryRequest(method, url, body, headers);
                console.log(this.match(inMemoryRequest));
            })
        });
        return this;
    }

    invoke(request: Request): Response {
        return this.match(request)
    }

    match(request: Request): Response {
        let fn = this.fn;
        let path = this.path;
        if (request.uri == path) {
            let response = fn(request);
            let inMemoryResponse = new InMemoryResponse(response.status, response.body);
            console.log("resp: ");
            console.log(inMemoryResponse.body.toString());
            return inMemoryResponse
        } else {
            let body = new Body(Buffer.from(`${request.method} to ${request.uri} did not match route ${path}`));
            return new InMemoryResponse("Not Found", body);
        }
    }


}

