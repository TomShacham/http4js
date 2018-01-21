import {InMemoryRequest} from "./src/main/core/InMemoryRequest";
import {HttpMessage, Method} from "./src/main/core/HttpMessage";
import {routes} from "./src/main/core/RoutingHttpHandler";

let req: HttpMessage = new InMemoryRequest(Method.GET, "/path");
console.log(routes("/path").asServer(3000));

