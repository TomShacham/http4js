import {Response} from "./Response";
import {HttpHandler} from "./HttpMessage";
import {Request} from "./Request";
import {Body} from "./Body";
import {Http4jsServer, Server} from "./Server";
import {Uri} from "./Uri";

export interface RoutingHttpHandler {
    withFilter(filter: (HttpHandler) => HttpHandler): RoutingHttpHandler
    asServer(port: number): Http4jsServer
    match(request: Request): Response
}

export function routes(path: string, method: string, handler: HttpHandler): ResourceRoutingHttpHandler {
    return new ResourceRoutingHttpHandler(path, method, handler);
}

export function getTo(path: string, handler: HttpHandler): ResourceRoutingHttpHandler {
    return new ResourceRoutingHttpHandler(path, "GET", handler);
}

export function postTo(path: string, handler: HttpHandler): ResourceRoutingHttpHandler {
    return new ResourceRoutingHttpHandler(path, "POST", handler);
}

export class ResourceRoutingHttpHandler implements RoutingHttpHandler {

    server: Http4jsServer;
    private path: string;
    private handlers: object = {};
    private filters: Array<any> = [];

    constructor(path: string,
                method: string,
                handler: HttpHandler) {
        this.path = path;
        this.handlers[path] = {verb: method, handler: handler};
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

    match(request: Request): Response {
        let paths = Object.keys(this.handlers);
        let exactMatch = paths.find(handlerPath => {
            return request.uri.templateMatch(handlerPath) && this.handlers[handlerPath].verb == request.method
        });
        let fuzzyMatch = paths.find(handlerPath => {
            return handlerPath == "/"
                ? false
                : handlerPath.includes("{") && Uri.of(handlerPath).templateMatch(request.uri.path) && this.handlers[handlerPath].verb == request.method
        });
        let match = exactMatch || fuzzyMatch;
        if (match) {
            let handler = this.handlers[match].handler;
            let filtered = this.filters.reduce((acc, next) => { return next(acc) }, handler);
            if (match.includes("{")) request.pathParams = Uri.of(match).extract(request.uri.path).matches;
            let response = filtered(request);
            return response;
        } else {
            let filtered = this.filters.reduce((acc, next) => { return next(acc) }, this.defaultNotFoundHandler);
            return filtered(request);
        }
    }

    private defaultNotFoundHandler = (request: Request) => {
        let notFoundBody = `${request.method} to ${request.uri.template} did not match routes`;
        let body = new Body(notFoundBody);
        return new Response(404, body);
    };

    private createInMemResponse(chunks: Array<any>, method: any, url: any, headers: any): Response  {
        let body = new Body(Buffer.concat(chunks));
        let inMemRequest = new Request(method, url, body, headers);
        return this.match(inMemRequest);
    }

}

