import {Req} from "./Req";
import {HttpHandler} from "./HttpMessage";

export type Filter = (HttpHandler: HttpHandler) => HttpHandler

export class Filters {
    static UPGRADE_TO_HTTPS: Filter = (handler: HttpHandler) => (req: Req) => {
        return handler(req.withUri(req.uri.withProtocol("https")));
    };

    static TIMING: Filter = (handler: HttpHandler) => (req: Req) => {
        const start = Date.now();
        return handler(req).then(response => {
            const total = Date.now() - start;
            return response.withHeader("Total-Time", total.toString())
        });
    };

    static DEBUG: Filter = debugFilter(console);

}

export function debugFilter(out: any): Filter {
    return (handler: HttpHandler) => (req: Req) => {
        const response = handler(req);
        return response.then(response => {
            out.log(`${req.method} to ${req.uri.asUriString()} with response ${response.status}`);
            return response;
        });
    }
}