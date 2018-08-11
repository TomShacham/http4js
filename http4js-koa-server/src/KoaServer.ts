import {Routing} from "../../http4js-core/src/core/Routing";
import {Res} from "../../http4js-core/src/core/Res";
import {Http4jsServer} from "../../http4js-core/src/servers/Server";
import {KeyValues, HeadersType} from "../../http4js-core/src/core/HttpMessage";
import {ReqOf} from "../";

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

    private createInMemResponse(chunks: Array<any>, method: string, url: string, headers: HeadersType): Promise<Res> {
        const inMemRequest = headers['content-type'] == 'application/x-www-form-urlencoded'
            ? ReqOf(method, url, JSON.stringify(chunks), headers).withForm(chunks)
            : ReqOf(method, url, Buffer.concat(chunks).toString(), headers);
        return this.routing.serve(inMemRequest);
    }

    start(): void {
        this.serverCloseHandle = this.server.listen(this.port);
    }

    stop(): void {
        this.serverCloseHandle.close();
    }
}
