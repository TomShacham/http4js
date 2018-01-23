import {InMemoryRequest} from "./src/main/core/InMemoryRequest";
import {HttpMessage, Method, Request, Body} from "./src/main/core/HttpMessage";
import {routes} from "./src/main/core/RoutingHttpHandler";
import {InMemoryResponse} from "./src/main/core/InMemoryResponse";

let req: HttpMessage = new InMemoryRequest(Method.GET, "/path");
let fn = (req: Request)=>{ return new InMemoryResponse("200 OK", new Body(Buffer.from(`${req.method} to ${req.uri}`)))};
console.log(routes("/path", fn).asServer(3000));

