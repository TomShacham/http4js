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

export function routes(path: string, handler: HttpHandler): ResourceRoutingHttpHandler {
    return new ResourceRoutingHttpHandler(path, handler);
}

export class ResourceRoutingHttpHandler implements RoutingHttpHandler {

    private path: string;
    private server: Http4jsServer;
    private handler: HttpHandler;

    constructor(path: string, handler: HttpHandler) {
        this.path = path;
        this.handler = handler;
    }

    withFilter(filter: (HttpHandler) => HttpHandler): RoutingHttpHandler {
        return new ResourceRoutingHttpHandler(this.path, filter(this.handler));
    }


    asServer(port: number, server: BasicServer = new BasicServer()): ResourceRoutingHttpHandler {
        this.server = server;
        server.start(port);
        server.server.on("request", (req, res) => {
            const {headers, method, url} = req;
            let chunks = [];
            req.on('error', (err) => {
                console.error(err);
            }).on('data', (chunk) => {
                chunks.push(chunk);
            }).on('end', () => {
                let body = new Body(Buffer.concat(chunks));
                let inMemoryRequest = new Request(method, url, body, headers);
                res.end(this.match(inMemoryRequest).bodystring());
            })
        });
        return this;
    }

    match(request: Http4jsRequest): Response {
        let handler = this.handler;
        let path = this.path;
        if (request.uri == path) {
            return handler(request);
        } else {
            let body = new Body(Buffer.from(`${request.method} to ${request.uri} did not match route ${path}`));
            return new Response(body);
        }
    }


}

