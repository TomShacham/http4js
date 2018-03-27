import {Request} from "./Request";
import {HttpHandler} from "./HttpMessage";

export type Filter = (HttpHandler: HttpHandler) => HttpHandler

export class Filters {
    static UPGRADE_TO_HTTPS: Filter = (handler: HttpHandler) => (req: Request) => {
        return handler(req.setUri(req.uri.withProtocol("https")));
    }
}
