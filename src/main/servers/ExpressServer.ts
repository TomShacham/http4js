import {RoutingHttpHandler} from "../core/Routing";
import {Response} from "../core/Response";
import {Body} from "../core/Body";
import {Request} from "../core/Request";
import {Http4jsServer} from "./Server";
import {HeaderValues} from "../core/Headers";

export class ExpressServer implements Http4jsServer {
    server;
    port: number;
    private routing;
    private serverCloseHandle;

    constructor(expressApp, port: number) {
        this.port = port;
        this.server = expressApp;
        return this;
    }

    registerCatchAllHandler(routing: RoutingHttpHandler): void {
        this.routing = routing;
        this.server.use((req, res, next) => {
            const {headers, method, url} = req;
            let body = Object.keys(req.body).length == 0 ? [] : req.body;
            if (headers['content-type'] == 'application/json') body = [Buffer.from(JSON.stringify(body))];
            const response = this.createInMemResponse(body, method, url, headers);
            response.then(response => {
                Object.keys(response.headers).forEach(header => res.setHeader(header, response.headers[header]));
                res.end(response.body.bytes);
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