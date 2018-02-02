import {Request} from "./src/main/core/Request";
import {Method, Http4jsRequest} from "./src/main/core/HttpMessage";
import {routes} from "./src/main/core/RoutingHttpHandler";
import {Response} from "./src/main/core/Response";
import {httpClient} from "./src/main/core/Client";
import {Body} from "./src/main/core/Body";

let req: Http4jsRequest = new Request(Method.GET, "/path");

let handler = (req: Request) => {
    return new Response(new Body(Buffer.from(`${req.method} to ${req.uri} with headers ${req.headers}`)))
};

routes("/path", handler).asServer(3000).start();

let options = {
    host: 'localhost',
    port: 3000,
    method: 'post',
    path: '/path',
    headers: {tom: ["pwns", "rocks", "smells"]}
};

httpClient().get(options).then(succ => console.log(succ));

