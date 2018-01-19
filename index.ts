import * as http from "http"
import {InMemoryRequest, Method} from "./src/main/core/InMemoryRequest";
import {HttpMessage} from "./src/main/core/HttpMessage";
import {InMemoryResponse} from "./src/main/core/InMemoryResponse";

http.createServer().listen(3000, "localhost", function () {
    let req: HttpMessage = new InMemoryRequest(Method.GET, "/path")
    console.log(routes("/path").invoke(req));
});


interface RoutingHttpHandler extends Router {
//     withFilter(filter: Filter): RoutingHttpHandler
//     withBasePath(path: String): RoutingHttpHandler
}

function routes(path: string): ResourceRoutingHttpHandler {
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


interface RoutingHttpHandler extends Router {
//     withFilter(filter: Filter): RoutingHttpHandler
//     withBasePath(path: String): RoutingHttpHandler
}

function routes(path: string): ResourceRoutingHttpHandler {
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

