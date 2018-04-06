import {RoutingHttpHandler} from "../core/Routing";

export interface Http4jsServer {
    server;
    port: number;

    registerCatchAllHandler(routing: RoutingHttpHandler): void
    start(): void
    stop(): void
}
