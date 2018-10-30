import {Res, ResOf} from "./Res";
import {HttpHandler, HeadersJson} from "./HttpMessage";
import {Req} from "./Req";
import {Filter} from "./Filters";
import {Http4jsServer} from "../servers/Server";
import {HttpClient} from "../client/HttpClient";
import {HttpServer} from "../servers/NativeServer";

export type MountedHttpHandler = { path: string, method: string, handler: HttpHandler, headers: HeadersJson, name: string }
export type DescribingHttpHandler = { path: string, method: string, headers: HeadersJson, name: string }
export type Route = {handler: MountedHttpHandler, filters: Filter[]}

export class Routing {

    private server?: Http4jsServer;
    private handlers: MountedHttpHandler[] = [];
    private filters: Array<(httpHandler: HttpHandler) => HttpHandler> = [];
    private nestedRouting: Routing[] = [];
    private readonly unnamedHandlerName = 'unnamed';

    constructor(method: string,
                path: string,
                handler: HttpHandler,
                headers?: HeadersJson,
                name?: string) {
        const pathNoTrailingSlash = path.endsWith('/') && path !== "/" ? path.slice(0, -1) : path;
        const handlerName = name || handler.name || this.unnamedHandlerName;
        this.handlers.push({
            path: pathNoTrailingSlash,
            method: method.toUpperCase(),
            handler,
            headers: headers || {},
            name: handlerName});
    }

    withRoutes(routes: Routing): Routing {
        this.nestedRouting.push(routes);
        return this;
    }

    withRoute(req: Req, handler: HttpHandler): Routing {
        this.handlers.push({path: req.uri.path(), method: req.method, headers: req.headers, handler, name: 'unnamed'});
        return this;
    }

    withFilter(filter: Filter): Routing {
        this.filters.push(filter);
        return this;
    }

    withHandler(method: string, path: string, handler: HttpHandler, headers: HeadersJson = {}, name?: string): Routing {
        this.handlers.push({path, method, headers, handler, name: name || this.unnamedHandlerName});
        return this;
    }

    asServer(server: Http4jsServer = HttpServer(3000)): Routing {
        this.server = server;
        server.registerCatchAllHandler(this);
        return this;
    }

    start(): void {
        if (!this.server) throw new Error('No server...');
        this.server.start();
    }

    stop(): void {
      if (!this.server) throw new Error('No server...');
        this.server.stop();
    }

    async serveE2E(req: Req): Promise<Res> {
      if (!this.server) throw new Error('No server...');
      const reqWithFqdn = req.withUri(`http://localhost:${this.server.port}${req.uri.asUriString()}`);
        if (!this.server) return ResOf(400, 'Routing does not have a server');
        await this.start();
        const response = await HttpClient(reqWithFqdn);
        await this.stop();
        return response;
    }

    serve(req: Req): Promise<Res> {
        const matchedRoute = this.match(req);
        const matchedHandler = matchedRoute ? matchedRoute.handler : this.mountedNotFoundHandler;
        const matchedFilters = matchedRoute ? matchedRoute.filters : this.filters;

        const filteringHandler = matchedFilters.reduce((prev, next) => {
            return next(prev)
        }, matchedHandler.handler);

        return filteringHandler(req.withPathParamsFromTemplate(matchedHandler.path)).catch(e => ResOf(500));
    }

    match(req: Req): Route | undefined {
        for (const routing of this.nestedRouting) {
            const matchedRouting = routing.match(req);
            if (matchedRouting){
                return {
                    handler: matchedRouting.handler,
                    filters: [...this.filters, ...matchedRouting.filters]
                };
            }
        }
        const matchThisRouting = this.matchThisRouting(req);
        return matchThisRouting
            ? { handler: matchThisRouting, filters: this.filters }
            : undefined;
    }

    matchThisRouting(req: Req): MountedHttpHandler | undefined {
        return this.handlers.find((handler: MountedHttpHandler) => {
            const fuzzyOrExactMatch = handler.path.includes("{") && handler.path != '/'
                ? req.uri.templateMatch(handler.path)
                : req.uri.exactMatch(handler.path);
            return fuzzyOrExactMatch
                && Routing.methodsMatch(req, handler)
                && Routing.headersMatch(req, handler);
        });
    }

    handlerByName(name: string): MountedHttpHandler | undefined {
        return this.handlers.find(it => it.name === name);
    }

    handlerByPath(path: string): MountedHttpHandler | undefined {
        return this.handlers.find(it => it.path === path);
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
        const routes = this.handlers.map(handler => ({
            method: handler.method,
            path: handler.path,
            headers: handler.headers,
            name: handler.name,
        }));
        return this.nestedRouting.reduce((allRoutes: DescribingHttpHandler[], nestedRouting: Routing) => {
            return allRoutes.concat(nestedRouting.routes())
        }, []).concat(routes);
    }

    private mountedNotFoundHandler: MountedHttpHandler = {
        path: ".*",
        method: ".*",
        headers: {},
        handler: async (request: Req) => {
            const notFoundBodystring = `${request.method} to ${request.uri.asUriString()} did not match routes`;
            return new Res(404, notFoundBodystring);
        },
        name: 'default not found'
    };

    private static methodsMatch(req: Req, it: MountedHttpHandler) {
        return req.method.match(it.method) != null;
    }

    private static headersMatch(req: Req, it: MountedHttpHandler): boolean {
        return JSON.stringify(req.headers) === JSON.stringify(it.headers)
            || JSON.stringify(it.headers) === JSON.stringify({});
    }

}

export function routes(method: string, path: string, handler: HttpHandler, headers: HeadersJson = {}, name?: string): Routing {
    return rootOf(method, path, handler, headers, name);
}

export function route(request: Req, handler: HttpHandler, name?: string): Routing {
    return rootOf(request.method, request.uri.path(), handler, request.headers, name);
}

export function get(path: string, handler: HttpHandler, headers: HeadersJson = {}, name?: string): Routing {
    return rootOf("GET", path, handler, headers, name);
}

export function post(path: string, handler: HttpHandler, headers: HeadersJson = {}, name?: string): Routing {
    return rootOf("POST", path, handler, headers, name);
}

export function put(path: string, handler: HttpHandler, headers: HeadersJson = {}, name?: string): Routing {
    return rootOf("PUT", path, handler, headers, name);
}

export function patch(path: string, handler: HttpHandler, headers: HeadersJson = {}, name?: string): Routing {
    return rootOf("PATCH", path, handler, headers, name);
}

export function options(path: string, handler: HttpHandler, headers: HeadersJson = {}, name?: string): Routing {
    return rootOf("OPTIONS", path, handler, headers, name);
}

export function head(path: string, handler: HttpHandler, headers: HeadersJson = {}, name?: string): Routing {
    return rootOf("HEAD", path, handler, headers, name);
}

function rootOf(method: string, path: string, handler: HttpHandler, headers: HeadersJson = {}, name?: string): Routing {
    return new Routing(method, path, handler, headers, name);
}