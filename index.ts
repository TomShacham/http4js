import {InMemoryRequest} from "./src/main/core/InMemoryRequest";
import {Method, Request, Body} from "./src/main/core/HttpMessage";
import {routes} from "./src/main/core/RoutingHttpHandler";
import {InMemoryResponse} from "./src/main/core/InMemoryResponse";
import {httpClient} from "./src/main/core/Client";

let req: Request = new InMemoryRequest(Method.GET, "/path");

let handler = (req: Request) => {
    return new InMemoryResponse("200 OK", new Body(Buffer.from(`${req.method} to ${req.uri}`)))
};

routes("/path", handler).asServer(3000);

let options = {
    host: 'localhost',
    port: 3000,
    method: 'post',
    path: '/path'
};

httpClient().get(options)
    .then(succ => console.log(succ));

