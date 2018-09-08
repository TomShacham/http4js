import * as fs from "fs";
import * as https from "https";
import {Http4jsServer} from "./Server";
import {Routing} from "../";
import {ReqOf} from "../core/Req";
import {ServerResponse, IncomingMessage} from "http";
import {Readable} from "stream";

type Certs = { key: Buffer; cert: Buffer; ca: Buffer };

export class NativeHttpsServer implements Http4jsServer {
    server: any;
    port: number;
    routing: Routing;
    validHostnameRegex: RegExp = new RegExp('^([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])(\.([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]{0,61}[a-zA-Z0-9]))*$')

    constructor(port: number, certs: Certs) {
        this.port = port;
        this.server = https.createServer(certs);
    }

    registerCatchAllHandler(routing: Routing): void {
        this.routing = routing;
        this.server.on("request", (req: IncomingMessage, res: ServerResponse) => {
            const {headers, method, url} = req;
            const hostname = this.hostnameFrom(req);
            const inStream = new Readable({ read() {} });

            req.on('error', (err: any) => {
                console.error(err);
            }).on('data', (chunk: Buffer) => {
                inStream.push(chunk);
            }).on('end', () => {
                inStream.push(null); // No more data

                const request = ReqOf(method!, `${hostname}${url}`, inStream, headers);
                const response = this.routing.serve(request);

                response.then(response => {
                    res.writeHead(response.status, response.headers);
                    const bodyStream = response.bodyStream();
                    if (bodyStream){
                        bodyStream.pipe(res);
                    } else {
                        res.write(response.bodyString());
                        res.end();
                    }
                }).catch(rej => console.log(rej));
            })
        });
    }

    async start(): Promise<void> {
        this.server.listen(this.port);
    }

    async stop(): Promise<void> {
        this.server.close();
    }

    private hostnameFrom(req: any): string {
        const hostHeader = req.headers.host;
        const isLocalhost = req.socket.localAddress === '::ffff:127.0.0.1';
        return this.validHostnameRegex.test(hostHeader)
            ? `http://${hostHeader}`
            : (isLocalhost ? `http://localhost:${req.socket.localPort}` : '');
    }

}