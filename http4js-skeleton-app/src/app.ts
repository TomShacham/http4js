import {Request} from "http4js/dist/core/Request";
import {Response} from "http4js/dist/core/Response";
import {RoutingHttpHandler, get} from "http4js/dist/core/Routing";
import {Filters} from "http4js/dist/core/Filters";

export class App {

    constructor(/*inject deps here*/) {
    }

    routes(): RoutingHttpHandler {
        return get("/hello", () => Promise.resolve(new Response(200, "Hello, world!")))
            .withFilter(Filters.TIMING);
    }

    serve(request: Request): Promise<Response> {
        return this.routes().serve(request);
    }


}
