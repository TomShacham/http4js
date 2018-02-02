import * as http from "http";
import {Response} from "./Response";
import {Http4jsRequest, HttpHandler} from "./HttpMessage";
import {Request} from "./Request";
import {Body} from "./Body";

interface Router {
    match(request: Http4jsRequest): Response
}

interface RoutingHttpHandler extends Router {
    withFilter(filter: (HttpHandler) => HttpHandler): RoutingHttpHandler
//     withBasePath(path: String): RoutingHttpHandler
    asServer(port: number): Http4jsServer
}

interface Http4jsServer {
    server;
    port: number;

    start(): void
    stop(): void
}

class BasicServer implements Http4jsServer {
    server;
    port: number;

    constructor(port: number) {
        this.port = port;
        this.server = http.createServer();
        return this;
    }

    start(): void {
        this.server.listen(this.port)
    }

    stop(): void {
        this.server.close()
    }

}

export function routes(path: string, handler: HttpHandler): ResourceRoutingHttpHandler {
    return new ResourceRoutingHttpHandler(path, handler);
}

export class ResourceRoutingHttpHandler implements RoutingHttpHandler {

    server: Http4jsServer;
    private path: string;
    private handler: HttpHandler;

    constructor(path: string, handler: HttpHandler) {
        this.path = path;
        this.handler = handler;
    }

    withFilter(filter: (HttpHandler) => HttpHandler): RoutingHttpHandler {
        return new ResourceRoutingHttpHandler(this.path, filter(this.handler));
    }


    asServer(port: number): Http4jsServer {
        this.server = new BasicServer(port);
        this.server.server.on("request", (req, res) => {
            const {headers, method, url} = req;
            let chunks = [];
            req.on('error', (err) => {
                console.error(err);
            }).on('data', (chunk) => {
                chunks.push(chunk);
            }).on('end', () => {
                let body = new Body(Buffer.concat(chunks));
                let inMemoryRequest = new Request(method, url, body, headers);
                let response = this.match(inMemoryRequest);
                res.writeHead(200, response.headers);
                res.end(response.bodystring());
            })
        });
        return this.server;
    }

    match(request: Http4jsRequest): Response {
        let handler = this.handler;
        let path = this.path;
        if (request.uri.match(path)) {
            return handler(request);
        } else {
            let body = new Body(Buffer.from(`${request.method} to ${request.uri} did not match route ${path}`));
            return new Response(body);
        }
    }


}

