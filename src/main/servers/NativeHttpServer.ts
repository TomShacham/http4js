import * as http from "http";
import {Routing} from "../core/Routing";
import {Res} from "../core/Res";
import {Req} from "../core/Req";
import {Http4jsServer} from "./Server";
import {HeaderValues} from "../core/Headers";
import {Form, HeadersType} from "../core/HttpMessage";
import { Readable } from 'stream';
import {Stream} from "stream";
import {BodyOf} from "../core/Body";
import {ReqOf} from "../core/Req";

export class NativeHttpServer implements Http4jsServer {
    server: any;
    port: number;
    routing: Routing;
    validHostnameRegex: RegExp = new RegExp('^([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])(\.([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]{0,61}[a-zA-Z0-9]))*$')

    constructor(port: number) {
        this.port = port;
        this.server = http.createServer();
    }

    registerCatchAllHandler(routing: Routing): void {
        this.routing = routing;
        this.server.on("request", (req: any, res: any) => {
            const {headers, method, url} = req;
            const inStream = new Readable({ read() {} });
            const hostname = this.hostnameFrom(req);

            req.on('error', (err: any) => {
                console.error(err);
            }).on('data', (chunk: Buffer) => {
                inStream.push(chunk);
            }).on('end', () => {
                inStream.push(null); // No more data

                const req = ReqOf(method, `${hostname}${url}`, BodyOf(inStream), headers);
                const response = this.routing.serve(req);

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

    private hostnameFrom(req: any) {
        const hostHeader = req.headers.host;
        const isLocalhost = req.socket.localAddress === '::ffff:127.0.0.1';
        return this.validHostnameRegex.test(hostHeader)
            ? `http://${hostHeader}`
            : (isLocalhost ? `http://localhost:${req.socket.localPort}` : '');
    }

    async start(): Promise<void> {
        this.server.listen(this.port);
    }

    async stop(): Promise<void> {
        this.server.close();
    }

}
