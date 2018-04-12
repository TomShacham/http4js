import {RoutingHttpHandler} from "../core/Routing";
import {Response} from "../core/Response";
import {Body} from "../core/Body";
import {Request} from "../core/Request";
import {Http4jsServer} from "./Server";

export class KoaServer implements Http4jsServer {
    server;
    port: number;
    private routing;
    private serverCloseHandle;

    constructor(koaApp, port: number) {
        this.port = port;
        this.server = koaApp;
        return this;
    }

    registerCatchAllHandler(routing: RoutingHttpHandler): void {
        this.routing = routing;
        this.server.use(async (ctx, next) => {
            const {headers, method, url} = ctx.request;
            let body = ctx.request.body && Object.keys(ctx.request.body).length != 0 ? ctx.request.body : [];
            if (headers['content-type'] == 'application/json') body = [Buffer.from(JSON.stringify(body))];
            const response = this.createInMemResponse(body, method, url, headers);
            response.then(response => {
                Object.keys(response.headers).forEach(header => ctx.set(header, response.headers[header]));
                ctx.response.body = response.body.bytes;
            });
            next();
        });
    }

    private createInMemResponse(chunks: Array<any>, method: any, url: any, headers: any): Promise<Response> {
        const body = new Body(Buffer.concat(chunks));
        const inMemRequest = new Request(method, url, body, headers);
        return this.routing.match(inMemRequest);
    }

    start(): void {
        this.serverCloseHandle = this.server.listen(this.port);
    }

    stop(): void {
        this.serverCloseHandle.close();
    }
}
