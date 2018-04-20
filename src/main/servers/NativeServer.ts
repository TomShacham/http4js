import * as http from "http";
import {RoutingHttpHandler} from "../core/Routing";
import {Response} from "../core/Response";
import {Body} from "../core/Body";
import {Request} from "../core/Request";
import {Http4jsServer} from "./Server";
import {Headers, HeaderValues} from "../core/Headers";

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
        const form = {};
        if (headers['content-type'] == HeaderValues.FORM) {
            body.bodyString().split("&").map(keyvalue => {
                const strings = keyvalue.split("=");
                const name = strings[0];
                const value = strings[1];
                if (form[name]) {
                    typeof (form[name]) == "string"
                        ? form[name] = [form[name], value]
                        : form[name].push(value);
                } else {
                    form[name] = value;
                }
            })
        }
        const inMemRequest = new Request(method, url, body, headers).setForm(form);
        return this.routing.match(inMemRequest);
    }

}
