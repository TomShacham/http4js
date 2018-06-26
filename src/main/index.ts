import {NativeServer} from "./servers/NativeServer";
export * from "./core/Routing";
export * from "./core/Req";
export * from "./core/Res";
export * from "./core/Uri";
export * from "./core/Headers";
export * from "./core/HttpMessage";
export * from "./core/Methods";
export * from "./core/Filters";
export * from "./core/Status";

export * from "./servers/Server";
export * from "./servers/ExpressServer";
export * from "./servers/KoaServer";

export * from "./client/Client";

import {get} from "./core/Routing";
import {ResOf} from "./core/Res";
import {Req} from "./core/Req";


get('/', async(req: Req) => ResOf(200, JSON.stringify(req.queries)))
    .asServer()
    .start();