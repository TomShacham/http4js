import {Request} from "./src/main/core/Request";
import {Method, Http4jsRequest} from "./src/main/core/HttpMessage";
import {routes} from "./src/main/core/RoutingHttpHandler";
import {Response} from "./src/main/core/Response";
import {httpClient} from "./src/main/core/Client";
import {Body} from "./src/main/core/Body";
import {Uri} from "./src/main/core/Uri";

let handler = (req: Request) => {
    let bodyString = `<h1>${req.method} to ${req.uri.href} with headers ${Object.keys(req.headers)}</h1>`;
    return new Response(200,
        new Body(Buffer.from(bodyString))
    )
};

routes("/path", handler).asServer(3000).start();

let request = new Request(Method.GET, Uri.of("http://localhost:3000/path"))
    .setHeader("tom", "rules");

httpClient().get(request).then(succ => console.log(succ));

