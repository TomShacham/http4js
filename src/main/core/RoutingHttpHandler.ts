import * as http from "http";
import {InMemoryResponse} from "./InMemoryResponse";
import {Response, Request, Router} from "./HttpMessage";
import {InMemoryRequest} from "./InMemoryRequest";

interface RoutingHttpHandler extends Router {
//     withFilter(filter: Filter): RoutingHttpHandler
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

export function routes(path: string): ResourceRoutingHttpHandler {
    return new ResourceRoutingHttpHandler(path);
}

class ResourceRoutingHttpHandler implements RoutingHttpHandler {

    private path: string;
    private server: Http4jsServer;

    constructor(path: string) {
        this.path = path
    }

    asServer(port: number, server: BasicServer = new BasicServer()): ResourceRoutingHttpHandler {
        this.server = server;
        server.start(port);
        server.server.on("request", (req, res) => {
            const { headers, method, url } = req;
            let inMemoryRequest = new InMemoryRequest(method, url);
            console.log(this.match(inMemoryRequest));
        });
        return this;
    }

    invoke(request: Request): Response {
        return this.match(request)
    }

    match(request: Request): Response {
        let path = this.path;
        if (request.uri == path) {
            return new InMemoryResponse("OK", "body")
        } else {
            return new InMemoryResponse("Not Found", `${request.method} to ${request.uri} did not match route ${path}`);
        }
    }


}

