import {Response} from "./Response";
import {Http4jsRequest, HttpHandler} from "./HttpMessage";
import {Request} from "./Request";
import {Body} from "./Body";
import {Http4jsServer, Server} from "./Server";

interface RoutingHttpHandler {
    withFilter(filter: (HttpHandler) => HttpHandler): RoutingHttpHandler
    asServer(port: number): Http4jsServer
    match(request: Http4jsRequest): Response
}

export function routes(path: string, method: string, handler: HttpHandler): ResourceRoutingHttpHandler {
    return new ResourceRoutingHttpHandler(path, method, handler);
}

export function getTo(path: string, handler: HttpHandler): ResourceRoutingHttpHandler {
    return new ResourceRoutingHttpHandler(path, "GET", handler);
}

export function postTo(path: string, handler: HttpHandler): ResourceRoutingHttpHandler {
    return new ResourceRoutingHttpHandler(path, "GET", handler);
}

export class ResourceRoutingHttpHandler implements RoutingHttpHandler {

    server: Http4jsServer;
    private path: string;
    private handler: object;
    private handlers: object = {};
    private filters: Array<any> = [];

    constructor(path: string,
                method: string,
                handler: HttpHandler) {
        this.path = path;
        let verbToHandler = {verb: method, handler: handler};
        this.handler = verbToHandler;
        this.handlers[path] = verbToHandler;
    }

    withRoutes(routes: ResourceRoutingHttpHandler): ResourceRoutingHttpHandler {
        for (let path of Object.keys(routes.handlers)) {
            let existingPath = this.path != "/" ? this.path : "";
            let nestedPath = existingPath + path;
            this.handlers[nestedPath] = routes.handlers[path]
        }
        return this;
    }

    withFilter(filter: (HttpHandler) => HttpHandler): ResourceRoutingHttpHandler {
        this.filters.push(filter);
        return this;
    }

    withHandler(path: string, method: string, handler: HttpHandler): ResourceRoutingHttpHandler {
        let existingPath = this.path != "/" ? this.path : "";
        let nestedPath = existingPath + path;
        this.handlers[nestedPath] = {verb: method, handler: handler};
        return this;
    }

    asServer(port: number): Http4jsServer {
        this.server = new Server(port);
        this.server.server.on("request", (req, res) => {
            const {headers, method, url} = req;
            let chunks = [];
            req.on('error', (err) => {
                console.error(err);
            }).on('data', (chunk) => {
                chunks.push(chunk);
            }).on('end', () => {
                let response = this.createInMemResponse(chunks, method, url, headers);
                res.writeHead(response.status, response.headers);
                res.end(response.body.bytes);
            })
        });
        return this.server;
    }

    match(request: Http4jsRequest): Response {
        let incomingPath = this.path;
        let paths = Object.keys(this.handlers);
        let matchedPath = paths.find(path => {
            console.log(request.uri.match(path))
            return request.uri.match(path) && this.handlers[path] && this.handlers[path].verb == request.method
        });
        if (matchedPath) {
            let handler = this.handlers[matchedPath].handler;
            let filtered = this.filters.reduce((acc, next) => { return next(acc) }, handler);
            let response = filtered(request);
            return response;
        } else {
            let notFoundBody = `${request.method} to ${request.uri.template} did not match route ${incomingPath}`;
            let body = new Body(notFoundBody);
            return new Response(404, body);
        }
    }

    private createInMemResponse(chunks: Array<any>, method: any, url: any, headers: any) {
        let body = new Body(Buffer.concat(chunks));
        let inMemRequest = new Request(method, url, body, headers);
        return this.match(inMemRequest);
    }

}

