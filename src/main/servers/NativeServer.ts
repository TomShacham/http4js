import * as http from "http";
import {Routing} from "../core/Routing";
import {Response} from "../core/Response";
import {Request} from "../core/Request";
import {Http4jsServer} from "./Server";
import {HeaderValues} from "../core/Headers";
import {KeyValues, Form} from "../core/HttpMessage";

export class NativeServer implements Http4jsServer {
    server: any;
    port: number;
    routing: Routing;

    constructor(port: number) {
        this.port = port;
        this.server = http.createServer();
        return this;
    }

    registerCatchAllHandler(routing: Routing): void {
        this.routing = routing;
        this.server.on("request", (req: any, res: any) => {
            const { headers, method, url } = req;
            const chunks: Buffer[] = [];
            req.on('error', (err: any) => {
                console.error(err);
            }).on('data', (chunk: Buffer) => {
                chunks.push(chunk);
            }).on('end', () => {
                const response = this.createInMemResponse(chunks, method, url, headers);
                response.then(response => {
                    res.writeHead(response.status, response.headers);
                    res.end(response.bodyString());
                }).catch(rej => console.log(rej));
            })
        });
    }

    start(): void {
        this.server.listen(this.port);
    }

    stop(): void {
        this.server.close();
    }

    private createInMemResponse(chunks: Buffer[], method: string, url: string, headers: KeyValues): Promise<Response> {
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
        const inMemRequest = new Request(method, url, body, headers).withForm(form);
        return this.routing.serve(inMemRequest);
    }

}
