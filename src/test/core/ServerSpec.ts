import {equal} from "assert";
import {getTo} from "../../main/core/RoutingHttpHandler";
import {Response} from "../../main/core/Response";
import {Body} from "../../main/core/Body";
import {Request} from "../../main/core/Request";
import {HttpHandler} from "../../main/core/HttpMessage";

describe('a basic in memory server', () => {

    it("takes request and gives response", function () {
        let requestBody = "Got it.";
        let handler = (req: Request) => { return new Response(200, req.body); };
        let resourceRoutingHttpHandler = getTo("/test", handler);
        let response = resourceRoutingHttpHandler.match(new Request("GET", "/test", new Body(requestBody)));

        equal(response.body.bodyString(), requestBody)
    });

    it("nests handlers", () => {
        let resourceRoutingHttpHandler = getTo("/test", () => { return new Response(200) })
            .withHandler("/nest", "GET", () => { return new Response(200, new Body("nested")) });

        let response = resourceRoutingHttpHandler.match(new Request("GET", "/test/nest"));

        equal(response.body.bodyString(), "nested")
    });

    it("add a filter", () => {
        let resourceRoutingHttpHandler = getTo("/test", () => { return new Response(200) })
            .withFilter(() => {
                return () => { return new Response(200, new Body("filtered"))}
            });
        let response = resourceRoutingHttpHandler.match(new Request("GET", "/test"));

        equal(response.body.bodyString(), "filtered")
    });

    it("chains filters", () => {
        let resourceRoutingHttpHandler = getTo("/test", () => { return new Response(200) })
            .withFilter(() => {
                return () => {
                    return new Response(200, new Body("filtered"))
                }
            })
            .withFilter((handler: HttpHandler) => {
                return (req: Request) => {
                    return handler(req).setHeader("another", "filter");
                }
            });
        let response = resourceRoutingHttpHandler.match(new Request("GET", "/test"));

        equal(response.body.bodyString(), "filtered");
        equal(response.getHeader("another"), "filter");
    });

    it("chains filters and handlers", () => {
        let resourceRoutingHttpHandler = getTo("/test", () => { return new Response(200) })
            .withHandler("/nest", "GET", () => { return new Response(200, new Body("nested")) })
            .withFilter((handler: HttpHandler) => {
                return (req: Request) => {
                    return handler(req).setHeader("a", "filter1");
                }
            })
            .withFilter((handler: HttpHandler) => {
                return (req: Request) => {
                    return handler(req).setHeader("another", "filter2");
                }
            });
        let response = resourceRoutingHttpHandler.match(new Request("GET", "/test/nest"));

        equal(response.body.bodyString(), "nested");
        equal(response.getHeader("a"), "filter1");
        equal(response.getHeader("another"), "filter2");
    });

    it("recursively defining routes", () => {
        let nested = getTo("/nested", (req: Request) => { return new Response(200).setBodystring("hi there deeply.")});
        let response = getTo("/", ()=>{return new Response(200)})
            .withRoutes(nested)
            .match(new Request("GET", "/nested"));

        equal(response.bodyString(), "hi there deeply.")
    })

});
