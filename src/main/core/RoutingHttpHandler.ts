import {Response} from "./Response";
import {HttpHandler} from "./HttpMessage";
import {Request} from "./Request";
import {Body} from "./Body";
import {Http4jsServer, Server} from "./Server";
import {Uri} from "./Uri";
import {Filter} from "./Filters";

export interface RoutingHttpHandler {
    withFilter(filter: (HttpHandler) => HttpHandler): RoutingHttpHandler
    asServer(server: Server): Http4jsServer
    match(request: Request): Promise<Response>
}

export class ResourceRoutingHttpHandler implements RoutingHttpHandler {

    server: Http4jsServer;
    private root: string;
    private handlers = [];
    private filters: Array<(HttpHandler) => HttpHandler> = [];

    constructor(path: string,
                method: string,
                handler: HttpHandler) {
        this.root = path;
        this.handlers.push({path: path, verb: method, handler: handler});
    }

    withRoutes(routes: ResourceRoutingHttpHandler): ResourceRoutingHttpHandler {
        this.handlers = this.handlers.concat(routes.handlers);
        return this;
    }

    withFilter(filter: Filter): ResourceRoutingHttpHandler {
        this.filters.push(filter);
        return this;
    }

    withHandler(path: string, method: string, handler: HttpHandler): ResourceRoutingHttpHandler {
        let existingPath = this.root != "/" ? this.root : "";
        let nestedPath = existingPath + path;
        this.handlers.push({path: nestedPath, verb: method, handler: handler});
        return this;
    }

    asServer(server: Server): Http4jsServer {
        this.server = server;
        server.registerCatchAllHandler(this);
        return this.server;
    }

    match(request: Request): Promise<Response> {
        let exactMatch = this.handlers.find(it => {
            return request.uri.exactMatch(it.path) && it.verb == request.method
        });
        let fuzzyMatch = this.handlers.find(it => {
            return it.path == "/"
                ? false
                : it.path.includes("{") && Uri.of(it.path).templateMatch(request.uri.path) && it.verb == request.method
        });
        let matchedHandler = exactMatch || fuzzyMatch;
        if (matchedHandler) {
            let handler = matchedHandler.handler;
            let filtered = this.filters.reduce((acc, next) => { return next(acc) }, handler);
            request.pathParams = matchedHandler.path.includes("{")
                ? Uri.of(matchedHandler.path).extract(request.uri.path).matches
                : {};
            return filtered(request);
        } else {
            let filtered = this.filters.reduce((acc, next) => { return next(acc) }, this.defaultNotFoundHandler);
            return filtered(request);
        }
    }

    private defaultNotFoundHandler = (request: Request) => {
        let notFoundBody = `${request.method} to ${request.uri.template} did not match routes`;
        let body = new Body(notFoundBody);
        return new Promise<Response>(resolve => resolve(new Response(404, body)));
    };

}

export function routes(method: string, path: string, handler: HttpHandler): ResourceRoutingHttpHandler {
    return new ResourceRoutingHttpHandler(path, method, handler);
}

export function getTo(path: string, handler: HttpHandler): ResourceRoutingHttpHandler {
    return new ResourceRoutingHttpHandler(path, "GET", handler);
}

export function postTo(path: string, handler: HttpHandler): ResourceRoutingHttpHandler {
    return new ResourceRoutingHttpHandler(path, "POST", handler);
}

export function putTo(path: string, handler: HttpHandler): ResourceRoutingHttpHandler {
    return new ResourceRoutingHttpHandler(path, "PUT", handler);
}

export function patchTo(path: string, handler: HttpHandler): ResourceRoutingHttpHandler {
    return new ResourceRoutingHttpHandler(path, "PATCH", handler);
}

export function deleteTo(path: string, handler: HttpHandler): ResourceRoutingHttpHandler {
    return new ResourceRoutingHttpHandler(path, "DELETE", handler);
}
