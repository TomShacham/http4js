import {Request} from "./Request";
import {HttpHandler} from "./HttpMessage";

export type Filter = (HttpHandler: HttpHandler) => HttpHandler

export class Filters {
    static UPGRADE_TO_HTTPS: Filter = (handler: HttpHandler) => (req: Request) => {
        return handler(req.withUri(req.uri.withProtocol("https")));
    };

    static TIMING: Filter = (handler: HttpHandler) => (req: Request) => {
        const start = Date.now();
        return handler(req).then(response => {
            const total = Date.now() - start;
            return response.withHeader("Total-Time", total.toString())
        });
    };

    static DEBUG: Filter = debugFilter(console);

}

export function debugFilter(out): Filter {
    return (handler: HttpHandler) => (req: Request) => {
        const response = handler(req);
        return response.then(response => {
            out.log(`${req.method} to ${req.uri.asUriString()} with response ${response.status}`);
            return response;
        });
    }
}