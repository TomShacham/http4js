import * as fs from "fs";
import * as https from 'https';
import {Res} from "../core/Res";
import {Http4jsServer} from "./Server";
import {Routing} from "../";
import {Form, HeadersType} from "../core/HttpMessage";
import {Req} from "../core/Req";
import {HeaderValues} from "../core/Headers";

require('ssl-root-cas')
    .inject()
    .addFile('src/ssl/my-root-ca.cert.pem');

type Certs = { key: Buffer; cert: Buffer; ca: Buffer };

export class NativeHttpsServer implements Http4jsServer {
    server: any;
    port: number;
    options: Certs;
    routing: Routing;
    validHostnameRegex: RegExp = new RegExp('^([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])(\.([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]{0,61}[a-zA-Z0-9]))*$')

    constructor(port: number, options: Certs | undefined = undefined) {
        const certs = {
            key: fs.readFileSync('src/ssl/key.pem'),
            cert: fs.readFileSync('src/ssl/fullchain.pem'),
            ca: fs.readFileSync('src/ssl/my-root-ca.cert.pem'),
        };
        this.options = options || certs;
        this.port = port;
        this.server = https.createServer(this.options);
    }

    registerCatchAllHandler(routing: Routing): void {
        this.routing = routing;
        this.server.on("request", (req: any, res: any) => {
            const {headers, method, url} = req;
            const hostHeader = req.headers.host;
            const isLocalhost = req.socket.localAddress === '::ffff:127.0.0.1';
            const hostname = this.validHostnameRegex.test(hostHeader)
                ? `http://${hostHeader}`
                : (isLocalhost ? `http://localhost:${req.socket.localPort}` : '');
            const chunks: Buffer[] = [];
            req.on('error', (err: any) => {
                console.error(err);
            }).on('data', (chunk: Buffer) => {
                chunks.push(chunk);
            }).on('end', () => {
                const response = this.createInMemResponse(chunks, method, `${hostname}${url}`, headers);
                response.then(response => {
                    res.writeHead(response.status, response.headers);
                    res.end(response.bodyString());
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

    private createInMemResponse(chunks: Buffer[], method: string, url: string, headers: HeadersType): Promise<Res> {
        const body = Buffer.concat(chunks).toString();
        const form: Form = {};
        if (headers['content-type'] == HeaderValues.FORM) {
            body.split("&").map(keyvalue => {
                const strings = keyvalue.split("=");
                const name = strings[0];
                const value = strings[1];
                if (form[name]) {
                    typeof (form[name]) === "string"
                        ? (form[name]) = [(form[name] as string), value]
                        : (form[name] as string[]).push(value);
                } else {
                    form[name] = value;
                }
            })
        }
        const inMemRequest = new Req(method, url, body, headers).withForm(form);
        return this.routing.serve(inMemRequest);
    }

}