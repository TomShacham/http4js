import {Request} from "./Request";
import {HttpHandler} from "./HttpMessage";

export type Filter = (HttpHandler: HttpHandler) => HttpHandler

export class Filters {
    static UPGRADE_TO_HTTPS: Filter = (handler: HttpHandler) => (req: Request) => {
        return handler(req.setUri(req.uri.withProtocol("https")));
    };

    static TIMING: Filter = (handler: HttpHandler) => (req: Request) => {
        return handler(req).then(response => response.setHeader("Total-Time", "500"));
    };

    static DEBUG: Filter = (handler: HttpHandler) => (req: Request) => {
        let response = handler(req);
        response.then(response => {
            console.log(`${req.method} to ${req.uri.href} with response ${response.status}`)
        });
        return response;
    };
}
