import {Req} from "./Req";
import {HttpHandler} from "./HttpMessage";
import {Redirect} from "./Res";

export type Filter = (HttpHandler: HttpHandler) => HttpHandler

export class Filters {
    static UPGRADE_TO_HTTPS: Filter = (handler: HttpHandler) => async (req: Req) => {
        if (req.header('x-forwarded-proto') !== 'https') {
            return Redirect(301, `https://${req.uri.hostname()}:${req.uri.port()}${req.uri.path()}`)
        } else {
            return handler(req);
        }
    };

    static TIMING: Filter = (handler: HttpHandler) => async (req: Req) => {
        const start = Date.now();
        const response = await handler(req);
        const total = Date.now() - start;
        return response.withHeader("Total-Time", total.toString());
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