import {Routing} from "../core/Routing";

export interface Http4jsServer {
    server;
    port: number;

    registerCatchAllHandler(routing: Routing): void
    start(): void
    stop(): void
}
