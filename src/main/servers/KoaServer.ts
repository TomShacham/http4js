import {RoutingHttpHandler} from "../core/Routing";
import {Response} from "../core/Response";
import {Body} from "../core/Body";
import {Request} from "../core/Request";
import {Http4jsServer} from "./Server";
import {HeaderValues} from "../core/Headers";

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
        const inMemRequest = headers['content-type'] == 'application/x-www-form-urlencoded'
            ? new Request(method, url, JSON.stringify(chunks), headers).setForm(chunks)
            : new Request(method, url, new Body(Buffer.concat(chunks)), headers);
        return this.routing.match(inMemRequest);
    }

    start(): void {
        this.serverCloseHandle = this.server.listen(this.port);
    }

    stop(): void {
        this.serverCloseHandle.close();
    }
}
