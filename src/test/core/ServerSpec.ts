import {equal} from "assert";
import {getTo, postTo} from "../../main/core/RoutingHttpHandler";
import {Response} from "../../main/core/Response";
import {Body} from "../../main/core/Body";
import {Request} from "../../main/core/Request";
import {HttpHandler} from "../../main/core/HttpMessage";

describe('a basic in memory server', () => {

    it("takes request and gives response", function () {
        let requestBody = "Got it.";
        let handler = (req: Request) => {
            return new Response(200, req.body);
        };
        let resourceRoutingHttpHandler = getTo("/test", handler);
        let response = resourceRoutingHttpHandler.match(new Request("GET", "/test", new Body(requestBody)));

        equal(response.body.bodyString(), requestBody)
    });

    it("nests handlers", () => {
        let resourceRoutingHttpHandler = getTo("/test", () => {
            return new Response(200)
        })
            .withHandler("/nest", "GET", () => {
                return new Response(200, new Body("nested"))
            });

        let response = resourceRoutingHttpHandler.match(new Request("GET", "/test/nest"));

        equal(response.body.bodyString(), "nested")
    });

    it("add a filter", () => {
        let resourceRoutingHttpHandler = getTo("/test", () => {
            return new Response(200)
        })
            .withFilter(() => {
                return () => {
                    return new Response(200, new Body("filtered"))
                }
            });
        let response = resourceRoutingHttpHandler.match(new Request("GET", "/test"));

        equal(response.body.bodyString(), "filtered")
    });

    it("chains filters", () => {
        let resourceRoutingHttpHandler = getTo("/test", () => {
            return new Response(200)
        })
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
        let resourceRoutingHttpHandler = getTo("/test", () => {
            return new Response(200)
        })
            .withHandler("/nest", "GET", () => {
                return new Response(200, new Body("nested"))
            })
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
        let nested = getTo("/nested", () => {
            return new Response(200).setBodystring("hi there deeply.")
        });
        let response = getTo("/", () => {
            return new Response(200)
        })
            .withRoutes(nested)
            .match(new Request("GET", "/nested"));

        equal(response.bodyString(), "hi there deeply.")
    });

    it("extracts path param", () => {
        let response = getTo("/{name}/test", (req) => {
            return new Response(200, new Body(req.pathParams["name"]))
        })
            .match(new Request("GET", "/tom/test"));

        equal(response.bodyString(), "tom");
    });

    it("extracts multiple path params", () => {
        let response = getTo("/{name}/test/{age}/bob/{personality}/fred", (req) => {
            return new Response(200, new Body(`${req.pathParams["name"]}, ${req.pathParams["age"]}, ${req.pathParams["personality"]}`))
        })
            .match(new Request("GET", "/tom/test/26/bob/odd/fred"));

        let pathParams = response.bodyString().split(", ");
        equal(pathParams[0], "tom");
        equal(pathParams[1], "26");
        equal(pathParams[2], "odd");
    });

    it("extracts query params", () => {
        let response = getTo("/test", (req) => {
            let queries = [
                req.getQuery("tosh"),
                req.getQuery("bosh"),
                req.getQuery("losh"),
            ];
            return new Response(200, new Body(queries.join("|")))
        }).match(new Request("GET", "/test?tosh=rocks&bosh=pwns&losh=killer"));

        equal(response.bodyString(), "rocks|pwns|killer");
    });

    it("unknown route returns a 404", () => {
        let response = getTo("/", (req) => {
            return new Response(200, new Body("hello, world!"))
        }).match(new Request("GET", "/unknown"));

        equal(response.status, 404);
    });

    it("custom 404s using filters", () => {
        let response = getTo("/", () => {
            return new Response(200, new Body("hello, world!"))
        }).withFilter((handler) => (req) => {
            if (handler(req).status == 404) {
                return new Response(404, new Body("Page not found"));
            } else {
                handler(req);
            }
        })
            .match(new Request("GET", "/unknown"));

        equal(response.status, 404);
        equal(response.bodyString(), "Page not found");
    });

    it("ordering - filters apply in order they are declared", () => {
        let response = getTo("/", () => {
            return new Response(200, new Body("hello, world!"))
        }).withFilter((handler) => (req) => {
            return handler(req).replaceHeader("person", "tosh")
        }).withFilter((handler) => (req) => {
            return handler(req).replaceHeader("person", "bosh")
        })
            .match(new Request("GET", "/"));

        equal(response.getHeader("person"), "bosh")
    });

    it("can prefilter requests", () => {
        let response = getTo("/", (req) => {
            return new Response(200, new Body(req.getHeader("pre-filter") || "hello, world!"))
        }).withPreFilter((req) => {
            return req.setHeader("pre-filter", "hello from pre-filter")
        })
            .match(new Request("GET", "/"));

        equal(response.bodyString(), "hello from pre-filter")
    });

    it("matches path params only if specified a capture in route", () => {
        let response = getTo("/family", () => {
            return new Response(200, new Body("losh,bosh,tosh"))
        })
            .match(new Request("GET", "/family/123"));

        equal(response.bodyString(), "GET to /family/123 did not match routes")
    });

    it("exact match handler", () => {
        let response = getTo("/", () => {
            return new Response(200, new Body("root"))
        }).withHandler("/family", "GET", () => {
            return new Response(200, new Body("exact"))
        }).withHandler("/family/{name}", "GET", () => {
            return new Response(200, new Body("fuzzy"))
        }).withHandler("/family", "POST", () => {
            return new Response(200, new Body("post"))
        })
            .match(new Request("GET", "/family"));

        equal(response.bodyString(), "exact")
    });

    it("Post redirect.", () => {
        let friends = [];
        let routes = getTo("/", () => {
            return new Response(200, new Body("root"))
        })
            .withHandler("/family", "GET", () => {
                return new Response(200, new Body(friends.join(", ")))
            })
            .withHandler("/family/{name}", "GET", () => {
                return new Response(200, new Body("fuzzy"))
            })
            .withHandler("/family", "POST", (req) => {
                friends.push(req.form["name"]);
                return new Response(302).setHeader("Location", "/family")
            });

        let postSideEffect1 = routes.match(new Request("POST", "/family", new Body("name=tosh")));
        let postSideEffect2 = routes.match(new Request("POST", "/family", new Body("name=bosh")));
        let postSideEffect3 = routes.match(new Request("POST", "/family", new Body("name=losh")));
        let response = routes.match(new Request("GET", "/family"));

        equal(response.bodyString(), "tosh, bosh, losh")
    });

    it("extract form params", () => {
        let response = postTo("/family", (req) => {
            return new Response(200, new Body(req.form))
        })
            .match(new Request("POST", "/family", new Body("p1=1&p2=tom&p3=bosh&p4=losh")).setHeader("Content-Type", "application/x-www-form-urlencoded"));

        equal(response.bodyString(), {p1: 1, p2: "tom", p3: "bosh", p4: "losh"})

    });


});
