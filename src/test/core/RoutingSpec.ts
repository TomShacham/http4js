import {deepStrictEqual, equal} from "assert";
import {get, post, routes} from "../../main/core/Routing";
import {Response} from "../../main/core/Response";
import {Body} from "../../main/core/Body";
import {Request} from "../../main/core/Request";
import {HttpHandler} from "../../main/core/HttpMessage";

describe('routing', () => {

    it("takes request and gives response", function () {
        return get("/test", (req: Request) => {
            return Promise.resolve(new Response(200, req.body));
        })
            .serve(new Request("GET", "/test", new Body("Got it.")))
            .then(response => equal(response.body.bodyString(), "Got it."))
    });

    it("nests handlers", () => {
        return get("/test", () => {
            return Promise.resolve(new Response(200));
        })
            .withHandler("GET", "/nest", () => {
                return Promise.resolve(new Response(200, new Body("nested")));
            })
            .serve(new Request("GET", "/test/nest"))
            .then(response => equal(response.body.bodyString(), "nested"))
    });

    it("add a filter", () => {
        return get("/test", () => {
            return Promise.resolve(new Response(200));
        })
            .withFilter(() => {
                return () => {
                    return Promise.resolve(new Response(200, new Body("filtered")));
                }
            })
            .serve(new Request("GET", "/test"))
            .then(response => equal(response.body.bodyString(), "filtered"))
    });

    it("chains filters", () => {
        return get("/test", () => {
            return Promise.resolve(new Response(200));
        })
            .withFilter(() => {
                return () => {
                    return Promise.resolve(new Response(200, new Body("filtered")))
                }
            })
            .withFilter((handler: HttpHandler) => {
                return (req: Request) => {
                    return Promise.resolve(handler(req).then(response => response.withHeader("another", "filter")))
                }
            })
            .serve(new Request("GET", "/test"))
            .then(response => {
                equal(response.body.bodyString(), "filtered");
                equal(response.header("another"), "filter");
            })
    });

    it("chains filters and handlers", () => {
        return get("/test", () => {
            return Promise.resolve(new Response(200));
        })
            .withHandler("GET", "/nest", () => {
                return Promise.resolve(new Response(200, new Body("nested")));
            })
            .withFilter((handler: HttpHandler) => {
                return (req: Request) => {
                    return handler(req).then(response => response.withHeader("a", "filter1"));
                }
            })
            .withFilter((handler: HttpHandler) => {
                return (req: Request) => {
                    return handler(req).then(response => response.withHeader("another", "filter2"));
                }
            })
            .serve(new Request("GET", "/test/nest"))
            .then(response => {
                equal(response.bodyString(), "nested");
                equal(response.header("a"), "filter1");
                equal(response.header("another"), "filter2");
            })
    });

    it("withRoutes mounts handlers and filters", async () => {
        const nested = get("/nested", () => {
            return Promise.resolve(new Response(200).withBody("hi there deeply."));
        }).withFilter((handler) => (req) => handler(req).then(response => response.withHeader("nested", "routes")));

        const response = await get("/", () => {
            return Promise.resolve(new Response(200));
        })
            .withFilter((handler) => (req) => handler(req).then(response => response.withHeader("top-level", "routes")))
            .withRoutes(nested)
            .serve(new Request("GET", "/nested"));

        equal(response.header("top-level"), "routes");
        equal(response.header("nested"), "routes");
        equal(response.bodyString(), "hi there deeply.");
    });

    it("matches path params only if specified a capture in route", () => {
        return get("/family", () => {
            return Promise.resolve(new Response(200, "losh,bosh,tosh"));
        })
            .serve(new Request("GET", "/family/123"))
            .then(response => equal(response.bodyString(), "GET to /family/123 did not match routes"))
    });

    it("extracts path param", () => {
        return get("/{name}/test", (req) => {
            return Promise.resolve(new Response(200, new Body(req.pathParams["name"])));
        })
            .serve(new Request("GET", "/tom/test"))
            .then(response => equal(response.bodyString(), "tom"));
    });

    it("extracts multiple path params", () => {
        return get("/{name}/test/{age}/bob/{personality}/fred", (req) => {
            return new Promise(resolve => resolve(
                new Response(200, new Body(`${req.pathParams["name"]}, ${req.pathParams["age"]}, ${req.pathParams["personality"]}`))
            ))
        })
            .serve(new Request("GET", "/tom/test/26/bob/odd/fred"))
            .then(response => {
                const pathParams = response.bodyString().split(", ");
                equal(pathParams[0], "tom");
                equal(pathParams[1], "26");
                equal(pathParams[2], "odd");
            })
    });

    it("extracts query params", () => {
        return get("/test", (req) => {
            const queries = [
                req.query("tosh"),
                req.query("bosh"),
                req.query("losh"),
            ];
            return Promise.resolve(new Response(200, queries.join("|")));
        })
            .serve(new Request("GET", "/test?tosh=rocks&bosh=pwns&losh=killer"))
            .then(response => equal(response.bodyString(), "rocks|pwns|killer"));
    });

    it("unknown route returns a 404", () => {
        return get("/", () => {
            return Promise.resolve(new Response(200, "hello, world!"));
        })
            .serve(new Request("GET", "/unknown"))
            .then(response => equal(response.status, 404));
    });

    it("custom 404s using filters", () => {
        return get("/", () => {
            return Promise.resolve(new Response(200, "hello, world!"));
        })
            .withFilter((handler: HttpHandler) => {
                return (req: Request) => {
                    const responsePromise = handler(req);
                    return responsePromise.then(response => {
                        if (response.status == 404) {
                            return Promise.resolve(new Response(404, "Page not found"));
                        } else {
                            return Promise.resolve(response);
                        }
                    });
                }
            })
            .serve(new Request("GET", "/unknown"))
            .then(response => {
                equal(response.status, 404);
                equal(response.bodyString(), "Page not found");
            });
    });

    it("ordering - filters apply in order they are declared", () => {
        return get("/", () => {
            return Promise.resolve(new Response(200, new Body("hello, world!")));
        }).withFilter((handler) => (req) => {
            return handler(req).then(response => response.replaceHeader("person", "tosh"));
        }).withFilter((handler) => (req) => {
            return handler(req).then(response => response.replaceHeader("person", "bosh"));
        })
            .serve(new Request("GET", "/"))
            .then(response => equal(response.header("person"), "bosh"))
    });

    it("can add stuff to request using filters", () => {
        return get("/", (req) => {
            return Promise.resolve(new Response(200, new Body(req.header("pre-filter") || "hello, world!")));
        }).withFilter((handler) => (req) => {
            return handler(req.withHeader("pre-filter", "hello from pre-filter"))
        })
            .serve(new Request("GET", "/"))
            .then(response => equal(response.bodyString(), "hello from pre-filter"))
    });

    it("exact match handler", () => {
        return get("/", () => {
            return Promise.resolve(new Response(200, new Body("root")));
        }).withHandler("GET", "/family", () => {
            return Promise.resolve(new Response(200, new Body("exact")));
        }).withHandler("GET", "/family/{name}", () => {
            return Promise.resolve(new Response(200, new Body("fuzzy")));
        }).withHandler("POST", "/family", () => {
            return Promise.resolve(new Response(200, new Body("post")));
        })
            .serve(new Request("GET", "/family"))
            .then(response => equal(response.bodyString(), "exact"))
    });

    it("Post redirect.", () => {
        const friends = [];
        const routes = get("/", () => {
            return Promise.resolve(new Response(200, new Body("root")));
        })
            .withHandler("GET", "/family", () => {
                return Promise.resolve(new Response(200, new Body(friends.join(", "))));
            })
            .withHandler("GET", "/family/{name}", () => {
                return Promise.resolve(new Response(200, new Body("fuzzy")));
            })
            .withHandler("POST", "/family", (req) => {
                friends.push(req.form["name"]);
                return Promise.resolve(new Response(302).withHeader("Location", "/family"));
            });

        const postSideEffect1 = routes.serve(new Request("POST", "/family", new Body("name=tosh")));
        const postSideEffect2 = routes.serve(new Request("POST", "/family", new Body("name=bosh")));
        const postSideEffect3 = routes.serve(new Request("POST", "/family", new Body("name=losh")));

        return routes.serve(new Request("GET", "/family"))
            .then(response => equal(response.bodyString(), "tosh, bosh, losh"))


    });

    it("extract form params", () => {
        return post("/family", (req) => {
            return Promise.resolve(new Response(200, new Body(req.form)));
        })
            .serve(new Request("POST", "/family", new Body("p1=1&p2=tom&p3=bosh&p4=losh")).withHeader("Content-Type", "application/x-www-form-urlencoded"))
            .then(response => {
                deepStrictEqual(response.body.bytes, {p1: "1", p2: "tom", p3: "bosh", p4: "losh"})
            })
    });

    it("matches method by regex", () => {
        return routes(".*", "/", () => Promise.resolve(new Response(200, "matched")) )
            .serve(new Request("GET", "/"))
            .then(response => {
                equal(response.bodyString(), "matched");
            })
    });

    it("matches path by regex", () => {
        return routes(".*", ".*", () => Promise.resolve(new Response(200, "matched")) )
            .serve(new Request("GET", "/any/path/matches"))
            .then(response => {
                equal(response.bodyString(), "matched");
            })
    });

});
