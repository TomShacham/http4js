import * as http from "http";

export interface Http4jsServer {
    server;
    port: number;

    start(): void
    stop(): void
}


export class Server implements Http4jsServer {
    server;
    port: number;

    constructor(port: number) {
        this.port = port;
        this.server = http.createServer();
        return this;
    }

    start(): void {
        this.server.listen(this.port)
    }

    stop(): void {
        this.server.close()
    }

}
