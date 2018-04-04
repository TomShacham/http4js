import * as http from "http";
import {RoutingHttpHandler} from "./RoutingHttpHandler";
import {Response} from "./Response";
import {Body} from "./Body";
import {Request} from "./Request";
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
