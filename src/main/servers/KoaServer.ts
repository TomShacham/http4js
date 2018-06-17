import {Routing} from "../core/Routing";
import {Response} from "../core/Response";
import {Request} from "../core/Request";
import {Http4jsServer} from "./Server";
import {KeyValues} from "../core/HttpMessage";

export class KoaServer implements Http4jsServer {
    server: any;
    port: number;
    private routing: Routing;
    private serverCloseHandle: any;

    constructor(koaApp: any, port: number) {
        this.port = port;
        this.server = koaApp;
        return this;
    }

    registerCatchAllHandler(routing: Routing): void {
        this.routing = routing;
        this.server.use(async (ctx: any, next: any) => {
            const {headers, method, url} = ctx.request;
            let body = ctx.request.body && Object.keys(ctx.request.body).length != 0 ? ctx.request.body : [];
            if (headers['content-type'] == 'application/json') body = [Buffer.from(JSON.stringify(body))];
            const response = this.createInMemResponse(body, method, url, headers);
            response.then(response => {
                Object.keys(response.headers).forEach(header => ctx.set(header, response.headers[header]));
                ctx.response.body = response.bodyString();
            });
            next();
        });
    }

    private createInMemResponse(chunks: Array<any>, method: string, url: string, headers: KeyValues): Promise<Response> {
        const inMemRequest = headers['content-type'] == 'application/x-www-form-urlencoded'
            ? new Request(method, url, JSON.stringify(chunks), headers).withForm(chunks)
            : new Request(method, url, Buffer.concat(chunks).toString(), headers);
        return this.routing.serve(inMemRequest);
    }

    start(): void {
        this.serverCloseHandle = this.server.listen(this.port);
    }

    stop(): void {
        this.serverCloseHandle.close();
    }
}
