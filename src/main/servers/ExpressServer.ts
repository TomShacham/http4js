import {Routing} from "../core/Routing";
import {Res} from "../core/Res";
import {Http4jsServer} from "./Server";
import {KeyValues, HeadersType} from "../core/HttpMessage";
import {ReqOf} from "../";

export class ExpressServer implements Http4jsServer {
    server: any;
    port: number;
    private routing: Routing;
    private serverCloseHandle: any;

    constructor(expressApp: any, port: number) {
        this.port = port;
        this.server = expressApp;
        return this;
    }

    registerCatchAllHandler(routing: Routing): void {
        this.routing = routing;
        this.server.use((req: any, res: any, next: any) => {
            const { headers, method, url } = req;
            let body = Object.keys(req.body).length === 0 ? [] : req.body;
            if (headers['content-type'] == 'application/json') body = [Buffer.from(JSON.stringify(body))];
            const response = this.createInMemResponse(body, method, url, headers);
            response.then(response => {
                Object.keys(response.headers).forEach(header => res.setHeader(header, response.headers[header]));
                res.end(response.bodyString());
            });
            next();
        });
    }

    private createInMemResponse(chunks: Buffer[] | string, method: string, url: string, headers: HeadersType): Promise<Res> {
        const inMemRequest = headers['content-type'] == 'application/x-www-form-urlencoded'
            ? ReqOf(method, url, JSON.stringify(chunks), headers).withForm(chunks)
            : ReqOf(method, url, Buffer.concat((chunks) as Buffer[]).toString(), headers);
        return this.routing.serve(inMemRequest);
    }

    start(): void {
        this.serverCloseHandle = this.server.listen(this.port);
    }

    stop(): void {
        this.serverCloseHandle.close();
    }
}