import * as http from "http";
import {Request} from "./Request";
import {Body} from "./Body";
import {Response} from "./Response";
import {RoutingHttpHandler} from "./RoutingHttpHandler";

export interface Http4jsServer {
    server;
    port: number;

    registerCatchAllHandler(routing: RoutingHttpHandler): void
    start(): void
    stop(): void
}

export class ExpressServer implements Http4jsServer {
    constructor(expressApp, port: number) {
        this.port = port;
        this.server = expressApp;
        return this;
    }

    registerCatchAllHandler(routing: RoutingHttpHandler): void {
        this.routing = routing;
        this.server.use((req, res, next) => {
            const {headers, method, url} = req;
            const body = req.body || [];
            let response = this.createInMemResponse(body, method, url, headers);
            response.then(response => {
                Object.keys(response.headers).forEach(header => res.setHeader(header, response.headers[header]))
                res.end(response.body.bytes);
            });
            next();
        });
    }

    private createInMemResponse(chunks: Array<any>, method: any, url: any, headers: any): Promise<Response> {
        let body = new Body(Buffer.concat(chunks));
        let inMemRequest = new Request(method, url, body, headers);
        return this.routing.match(inMemRequest);
    }

    start(): void {
        this.server.listen(this.port);
    }

    stop(): void {
        console.log("Forcing express to stop by listening again on the same port... lol");
        this.server.listen(this.port);
    }
}

export class Server implements Http4jsServer {
    server;
    port: number;
    routing: RoutingHttpHandler;

    constructor(port: number) {
        this.port = port;
        this.server = http.createServer();
        return this;
    }

    registerCatchAllHandler(routing: RoutingHttpHandler): void {
        this.routing = routing;
        this.server.on("request", (req, res) => {
            const {headers, method, url} = req;
            let chunks = [];
            req.on('error', (err) => {
                console.error(err);
            }).on('data', (chunk) => {
                chunks.push(chunk);
            }).on('end', () => {
                let response = this.createInMemResponse(chunks, method, url, headers);
                response.then(response => {
                    res.writeHead(response.status, response.headers);
                    res.end(response.body.bytes);
                });
            })
        });
    }

    start(): void {
        this.server.listen(this.port);
    }

    stop(): void {
        this.server.close();
    }

    private createInMemResponse(chunks: Array<any>, method: any, url: any, headers: any): Promise<Response> {
        let body = new Body(Buffer.concat(chunks));
        let inMemRequest = new Request(method, url, body, headers);
        return this.routing.match(inMemRequest);
    }

}
