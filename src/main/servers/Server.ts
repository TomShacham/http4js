import {Routing} from "../core/Routing";
import * as http from 'http';
import * as https from 'https';

export interface Http4jsServer {
    server: http.Server | https.Server;
    port: number;

    registerCatchAllHandler(routing: Routing): void
    start(): void
    stop(): void
}
