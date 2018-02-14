import {Request} from "./src/main/core/Request";
import {Method, HttpHandler} from "./src/main/core/HttpMessage";
import {routes} from "./src/main/core/RoutingHttpHandler";
import {Response} from "./src/main/core/Response";
import {httpClient} from "./src/main/core/Client";
import {Body} from "./src/main/core/Body";
import {Uri} from "./src/main/core/Uri";
import {Renderer} from "./src/main/render/Renderer";

console.log(new Renderer().render("README.md"));

let handler = (req: Request) => {
    let bodyString = `<h1>${req.method} to ${req.uri.href} with headers ${Object.keys(req.headers)}</h1>`;
    let renderer = new Renderer();
    // renderer.render("views/hello-world");
    return new Response(200,
        new Body(Buffer.from(bodyString))
    )
};

let headerFilter = (handler: HttpHandler) => {
    return (req: Request) => {
        return handler(req.setHeader("filter", "1"));
    }
};

routes("/path", handler)
    .withHandler("/tom", handler)
    .withFilter(headerFilter)
    .asServer(3000).start();

let request = new Request(Method.GET, Uri.of("http://localhost:3000/path/tom"))
    .setHeader("tom", "rules");

httpClient().get(request).then(succ => {
    console.log("body string");
    console.log(succ.body.bodyString());
    console.log("headers");
    console.log(succ.headers);
});

