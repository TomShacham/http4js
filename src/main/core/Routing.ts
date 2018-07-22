import {Res} from "./Res";
import {HttpHandler, KeyValues, HeadersType} from "./HttpMessage";
import {Req} from "./Req";
import {Uri} from "./Uri";
import {Filter} from "./Filters";
import {Http4jsServer} from "../servers/Server";
import {NativeHttpServer} from "../servers/NativeHttpServer";
import {ResOf} from "./Res";
import {HttpClient} from "../client/HttpClient";

export type MountedHttpHandler = { path: string, method: string, headers: HeadersType, handler: HttpHandler }
export type DescribingHttpHandler = { path: string, method: string, headers: HeadersType }

export class Routing {

    server: Http4jsServer;
    private root: string;
    private handlers: MountedHttpHandler[] = [];
    private filters: Array<(httpHandler: HttpHandler) => HttpHandler> = [];
    private nestedRouting: Routing[] = [];

    constructor(method: string,
                path: string,
                headers: HeadersType = {},
                handler: HttpHandler) {
        this.root = path;
        const pathNoTrailingSlash = path.endsWith('/') && path !== "/" ? path.slice(0, -1) : path;
        this.handlers.push({path: pathNoTrailingSlash, method: method.toUpperCase(), headers, handler});
    }

    withRoutes(routes: Routing): Routing {
        this.nestedRouting.push(routes);
        return this;
    }

    withRoute(request: Req, handler: HttpHandler): Routing {
        const existingPath = this.root != "/" ? this.root : "";
        const nestedPath = existingPath + request.uri.path();
        this.handlers.push({path: nestedPath, method: request.method, handler: handler, headers: request.headers});
        return this;
    }

    withFilter(filter: Filter): Routing {
        this.filters.push(filter);
        return this;
    }

    withHandler(method: string, path: string, handler: HttpHandler, headers: HeadersType = {}): Routing {
        this.handlers.push({path, method, headers, handler});
        return this;
    }

    asServer(server: Http4jsServer = new NativeHttpServer(3000)): Routing {
        this.server = server;
        server.registerCatchAllHandler(this);
        return this;
    }

    start(): void {
        this.server.start();
    }

    stop(): void {
        this.server.stop();
    }

    async serveE2E(request: Req): Promise<Res> {
        if (!this.server) return ResOf(400, 'Routing does not have a server');
        await this.start();
        const response = await HttpClient(request.withUri(`http://localhost:${this.server.port}${request.uri.path()}`));
        await this.stop();
        return response;
    }

    serve(req: Req): Promise<Res> {
        const matchedRouting = [this, ...this.nestedRouting].map(routing => routing.matchRouting(req))
            .filter(it => it.handler !== it.routing.mountedNotFoundHandler);
        const match = matchedRouting[0] || {routing: this};
        const matchedHandler = match.handler || this.mountedNotFoundHandler;
        if (matchedHandler.path.includes("{"))
            req.pathParams = Uri.of(matchedHandler.path).extract(req.uri.path()).matches;
        const filtered = match.routing.filters.reduce((prev, next) => {
            return next(prev)
        }, matchedHandler.handler);
        return filtered(req);
    }

    matchRouting(req: Req): { routing: Routing, handler: MountedHttpHandler } {
        return {
            routing: this,
            handler: this.match(req),
        };
    }

    match(req: Req): MountedHttpHandler {
        const handlersMostPreciseFirst = this.handlersMostPreciseFirst();
        const exactMatch = handlersMostPreciseFirst.find(it => {
            return req.uri.exactMatch(it.path) &&
                req.method.match(it.method) != null &&
                (JSON.stringify(req.headers) === JSON.stringify(it.headers) || JSON.stringify(it.headers) === JSON.stringify({}));
        });
        if (exactMatch) return exactMatch;
        const fuzzyMatch = handlersMostPreciseFirst.find(it => {
            if (it.path == "/") return false;
            return it.path.includes("{") &&
                Uri.of(it.path).templateMatch(req.uri.path()) &&
                req.method.match(it.method) != null &&
                (JSON.stringify(req.headers) === JSON.stringify(it.headers) || JSON.stringify(it.headers) === JSON.stringify({}));
        });
        return fuzzyMatch || this.mountedNotFoundHandler;
    }

    withGet(path: string, handler: HttpHandler): Routing {
        return this.withHandler("GET", path, handler);
    }

    withPost(path: string, handler: HttpHandler): Routing {
        return this.withHandler("POST", path, handler);
    }

    withPut(path: string, handler: HttpHandler): Routing {
        return this.withHandler("PUT", path, handler);
    }

    withPatch(path: string, handler: HttpHandler): Routing {
        return this.withHandler("PATCH", path, handler);
    }

    withDelete(path: string, handler: HttpHandler): Routing {
        return this.withHandler("DELETE", path, handler);
    }

    withOptions(path: string, handler: HttpHandler): Routing {
        return this.withHandler("OPTIONS", path, handler);
    }

    withHead(path: string, handler: HttpHandler): Routing {
        return this.withHandler("HEAD", path, handler);
    }

    routes(): DescribingHttpHandler[] {
        return this.handlers.map(handler => ({
            method: handler.method,
            path: handler.path,
            headers: handler.headers
        }))
    }

    public mountedNotFoundHandler: MountedHttpHandler = {
        path: ".*",
        method: ".*",
        headers: {},
        handler: async (request: Req) => {
            const notFoundBodystring = `${request.method} to ${request.uri.asUriString()} did not match routes`;
            return new Res(404, notFoundBodystring);
        }
    };

    private handlersMostPreciseFirst(): MountedHttpHandler[] {
        return this.handlers.sort((h1, h2) => {
            return h1.path.split("/").length > h2.path.split("/").length ? -1 : 1;
        });
    }

}

export function routes(method: string, path: string, handler: HttpHandler, headers: HeadersType = {}): Routing {
    return new Routing(method, path, headers, handler);
}

export function route(request: Req, handler: HttpHandler): Routing {
    return new Routing(request.method, request.uri.path(), request.headers, handler);
}

export function get(path: string, handler: HttpHandler, headers: HeadersType = {}): Routing {
    return new Routing("GET", path, headers, handler);
}

export function post(path: string, handler: HttpHandler, headers: HeadersType = {}): Routing {
    return new Routing("POST", path, headers, handler);
}

export function put(path: string, handler: HttpHandler, headers: HeadersType = {}): Routing {
    return new Routing("PUT", path, headers, handler);
}

export function patch(path: string, handler: HttpHandler, headers: HeadersType = {}): Routing {
    return new Routing("PATCH", path, headers, handler);
}

export function options(path: string, handler: HttpHandler, headers: HeadersType = {}): Routing {
    return new Routing("OPTIONS", path, headers, handler);
}

export function head(path: string, handler: HttpHandler, headers: HeadersType = {}): Routing {
    return new Routing("HEAD", path, headers, handler);
}