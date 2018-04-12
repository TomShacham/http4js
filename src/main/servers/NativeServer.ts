import * as http from "http";
import {RoutingHttpHandler} from "../core/Routing";
import {Response} from "../core/Response";
import {Body} from "../core/Body";
import {Request} from "../core/Request";
import {Http4jsServer} from "./Server";

export class NativeServer implements Http4jsServer {
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
            const chunks = [];
            req.on('error', (err) => {
                console.error(err);
            }).on('data', (chunk) => {
                chunks.push(chunk);
            }).on('end', () => {
                const response = this.createInMemResponse(chunks, method, url, headers);
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
        const body = new Body(Buffer.concat(chunks));
        const inMemRequest = new Request(method, url, body, headers);
        return this.routing.match(inMemRequest);
    }

}
