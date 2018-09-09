import * as http from "http";
import * as https from "https";
import {IncomingMessage, ServerResponse} from "http";
import {Routing} from "../core/Routing";
import {ReqOf} from "../core/Req";
import {Http4jsServer} from "./Server";
import {Readable} from "stream";

export type Certs = { key: Buffer; cert: Buffer; ca: Buffer };

export class NativeServer implements Http4jsServer {
    server: http.Server | https.Server;
    port: number;
    validHostnameRegex: RegExp = new RegExp('^([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])(\.([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]{0,61}[a-zA-Z0-9]))*$')

    constructor(port: number, certs?: Certs) {
        this.port = port;
        this.server = certs ? https.createServer(certs) : http.createServer();
    }

    registerCatchAllHandler(routing: Routing): void {
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
                const response = routing.serve(request);

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

    private hostnameFrom(req: any) {
        const hostHeader = req.headers.host;
        const isLocalhost = req.socket.localAddress === '::ffff:127.0.0.1';
        return this.validHostnameRegex.test(hostHeader)
            ? `http://${hostHeader}`
            : (isLocalhost ? `http://localhost:${req.socket.localPort}` : '');
    }

}

export function HttpServer(port: number): NativeServer {
    return new NativeServer(port);
}
export function HttpsServer(port: number, certs: Certs): NativeServer {
    return new NativeServer(port, certs);
}
