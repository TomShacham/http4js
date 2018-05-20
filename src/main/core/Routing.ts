import {Response} from "./Response";
import {HttpHandler} from "./HttpMessage";
import {Request} from "./Request";
import {Uri} from "./Uri";
import {Filter} from "./Filters";
import {Http4jsServer} from "../servers/Server";
import {NativeServer} from "../servers/NativeServer";

export type MountedHttpHandler = {path: string, verb: string, handler: HttpHandler}

export class Routing {

    server: Http4jsServer;
    private root: string;
    private handlers: MountedHttpHandler[] = [];
    private filters: Array<(HttpHandler) => HttpHandler> = [];

    constructor(method: string,
                path: string,
                handler: HttpHandler) {
        this.root = path;
        this.handlers.push({path: path, verb: method, handler: handler});
    }

    withRoutes(routes: Routing): Routing {
        this.handlers = this.handlers.concat(routes.handlers);
        this.filters = this.filters.concat(routes.filters);
        return this;
    }

    withFilter(filter: Filter): Routing {
        this.filters.push(filter);
        return this;
    }

    withHandler(method: string, path: string, handler: HttpHandler): Routing {
        const existingPath = this.root != "/" ? this.root : "";
        const nestedPath = existingPath + path;
        this.handlers.push({path: nestedPath, verb: method, handler: handler});
        return this;
    }

    asServer(server: Http4jsServer = new NativeServer(3000)): Http4jsServer {
        this.server = server;
        server.registerCatchAllHandler(this);
        return this.server;
    }

    serve(request: Request): Promise<Response> {
        const matchedHandler = this.match(request);
        const filtered = this.filters.reduce((prev, next) => {
            return next(prev)
        }, matchedHandler.handler);
        request.pathParams = matchedHandler.path.includes("{")
            ? Uri.of(matchedHandler.path).extract(request.uri.path()).matches
            : {};
        return filtered(request);
    }

    match(request: Request): MountedHttpHandler {
        const exactMatch = this.handlers.find(it => {
            return request.uri.exactMatch(it.path) && request.method.match(it.verb) != null;
        });
        const fuzzyMatch = this.handlers.find(it => {
            if (it.path == "/") return false;
            return it.path.includes("{")
                && Uri.of(it.path).templateMatch(request.uri.path())
                && request.method.match(it.verb) != null;
        });
        return exactMatch || fuzzyMatch || this.mountedNotFoundHandler;
    }

    private mountedNotFoundHandler: MountedHttpHandler = {
        path: ".*",
        verb: ".*",
        handler: (request: Request) => {
            const notFoundBodystring = `${request.method} to ${request.uri.path()} did not match routes`;
            return Promise.resolve(new Response(404, notFoundBodystring));
        }
    }

}

export function routes(method: string, path: string, handler: HttpHandler): Routing {
    return new Routing(method, path, handler);
}

export function get(path: string, handler: HttpHandler): Routing {
    return new Routing("GET", path, handler);
}

export function post(path: string, handler: HttpHandler): Routing {
    return new Routing("POST", path, handler);
}

export function put(path: string, handler: HttpHandler): Routing {
    return new Routing("PUT", path, handler);
}

export function patch(path: string, handler: HttpHandler): Routing {
    return new Routing("PATCH", path, handler);
}
