import {InMemoryResponse} from "./InMemoryResponse";
import {Response, Request, Router} from "./HttpMessage";

interface RoutingHttpHandler extends Router {
//     withFilter(filter: Filter): RoutingHttpHandler
//     withBasePath(path: String): RoutingHttpHandler
}

export function routes(path: string): ResourceRoutingHttpHandler {
    return new ResourceRoutingHttpHandler(path);
}

class ResourceRoutingHttpHandler implements RoutingHttpHandler {

    path: string;

    constructor(path: string) {
        this.path = path
    }

    invoke(request: Request): Response {
        return this.match(request)
    }

    //
    // withFilter(filter: Filter): RoutingHttpHandler {
    //     return undefined;
    // }
    //
    // withBasePath(path: String): RoutingHttpHandler {
    //     return undefined;
    // }

    match(request: Request): Response {
        let path = this.path;
        if (request.uri == path) {
            return new InMemoryResponse("OK", "body")
        } else {
            return new InMemoryResponse("Not Found", `${request.method} to ${request.uri} did not match route ${path}`);
        }
    }


}

