import * as http from "http";
import {InMemoryRequest} from "./src/main/core/InMemoryRequest";
import {HttpMessage, Method} from "./src/main/core/HttpMessage";
import {routes} from "./src/main/core/RoutingHttpHandler";

http.createServer().listen(3000, "localhost", function () {
    let req: HttpMessage = new InMemoryRequest(Method.GET, "/path");
    console.log(routes("/path").invoke(req));
});
