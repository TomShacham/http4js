import {Request} from "./src/main/core/Request";
import {HttpHandler} from "./src/main/core/HttpMessage";
import {routes} from "./src/main/core/RoutingHttpHandler";
import {Response} from "./src/main/core/Response";
import {HttpClient} from "./src/main/core/Client";
import {Body} from "./src/main/core/Body";
import {Uri} from "./src/main/core/Uri";

let handler = (req: Request) => {
    let bodyString = `<h1>${req.method} to ${req.uri.href} with headers ${Object.keys(req.headers)}</h1>`;
    return new Response(200, new Body(Buffer.from(bodyString)))
};

let headerFilter = (handler: HttpHandler) => {
    return (req: Request) => {
        return handler(req.setHeader("filter", "1"));
    }
};

routes("/path", "GET", handler)
    .withHandler("/tom", "GET", handler)
    .withFilter(headerFilter)
    .asServer(3000).start();

let getRequest = new Request("GET", Uri.of("http://localhost:3000/path/tom")).setHeader("tom", "rules");
let postRequest = new Request("GET", Uri.of("http://localhost:3000/path/tom")).setHeader("tom", "rules");

let client = HttpClient;

client(getRequest).then(succ => {
    console.log("body string");
    console.log(succ.body.bodyString());
    console.log("headers");
    console.log(succ.headers);
});

client(postRequest).then(succ => {
    console.log("body string");
    console.log(succ.body.bodyString());
    console.log("headers");
    console.log(succ.headers);
});



