import {deepStrictEqual, equal} from "assert";
import {get, post, routes} from "../../main/core/Routing";
import {Response, Res} from "../../main/core/Response";
import {Request, Req} from "../../main/core/Request";
import {HttpHandler} from "../../main/core/HttpMessage";

describe('routing', async () => {

    it("takes request and gives response", async () => {
        const response = await get("/test", async(req: Request) => Res(200, req.body))
            .serve(new Request("GET", "/test", "Got it."));

        equal(response.bodyString(), "Got it.");
    });

    it("nests handlers", async () => {
        const response = await get("/test", async() => Res(200))
            .withHandler("GET", "/nest", async() => Res(200, "nested"))
            .serve(new Request("GET", "/test/nest"));

        equal(response.bodyString(), "nested");
    });

    it("add a filter", async () => {
        const response = await get("/test", () => {
            return Promise.resolve(new Response(200));
        })
            .withFilter(() => {
                return async () => {
                    return Res(200, "filtered");
                }
            })
            .serve(new Request("GET", "/test"));

        equal(response.bodyString(), "filtered");
    });

    it("chains filters", async () => {
        const response = await get("/test", async() => Res(200))
            .withFilter(() => {
                return async() => Res(200, "filtered");
            })
            .withFilter((handler: HttpHandler) => {
                return async(req: Request) => {
                    const response = await handler(req);
                    return response.withHeader("another", "filter");
                }
            })
            .serve(new Request("GET", "/test"));

        equal(response.bodyString(), "filtered");
        equal(response.header("another"), "filter");

    });

    it("chains filters and handlers", async () => {
        const response = await get("/test", async() => Res(200))
            .withHandler("GET", "/nest", async() => Res(200, "nested"))
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
            .serve(new Request("GET", "/test/nest"));

        equal(response.bodyString(), "nested");
        equal(response.header("a"), "filter1");
        equal(response.header("another"), "filter2");
    });

    it("withRoutes mounts handlers and filters", async () => {
        const nested = get("/nested", async () => {
            return Res(200).withBody("hi there deeply.")
        }).withFilter((handler) => {
            return (req) => handler(req).then(response => response.withHeader("nested", "routes"))
        });

        const response = await get("/", async () => Res(200))
            .withFilter((handler) => {
                return (req) => handler(req).then(response => response.withHeader("top-level", "routes"))
            })
            .withRoutes(nested)
            .serve(new Request("GET", "/nested"));

        equal(response.header("top-level"), "routes");
        equal(response.header("nested"), "routes");
        equal(response.bodyString(), "hi there deeply.");
    });

    it("matches path params only if specified a capture in route", async () => {
        const response = await get("/family", async() => Res(200, "losh,bosh,tosh"))
            .serve(new Request("GET", "/family/123"));

        equal(response.bodyString(), "GET to /family/123 did not match routes");
    });

    it("extracts path param", async () => {
        const response = await get("/{name}/test", async(req) => Res(200, req.pathParams["name"]))
            .serve(new Request("GET", "/tom-param/test"));

        equal(response.bodyString(), "tom-param");
    });

    it("extracts multiple path params", async () => {
        const response = await get("/{name}/test/{age}/bob/{personality}/fred", async(req) => {
            return Res(200, `${req.pathParams["name"]}, ${req.pathParams["age"]}, ${req.pathParams["personality"]}`)
        })
            .serve(new Request("GET", "/tom/test/26/bob/odd/fred"));

        const pathParams = response.bodyString().split(", ");
        equal(pathParams[0], "tom");
        equal(pathParams[1], "26");
        equal(pathParams[2], "odd");
    });

    it("extracts query params", async () => {
        const response = await get("/test", async(req) => {
            const queries = [
                req.query("tosh"),
                req.query("bosh"),
                req.query("losh"),
            ];
            return Res(200, queries.join("|"));
        })
            .serve(new Request("GET", "/test?tosh=rocks&bosh=pwns&losh=killer"));

        equal(response.bodyString(), "rocks|pwns|killer");
    });

    it("unknown route returns a 404", async () => {
        const response = await get("/", async() => Res(200, "hello, world!"))
            .serve(new Request("GET", "/unknown"));

        equal(response.status, 404);
    });

    it("custom 404s using filters", async () => {
        const response = await get("/", async() => Res(200, "hello, world!"))
            .withFilter((handler: HttpHandler) => {
                return async (req: Request) => {
                    const response = await handler(req);
                    if (response.status == 404) {
                        return Res(404, "Page not found");
                    } else {
                        return response;
                    }
                }
            })
            .serve(new Request("GET", "/unknown"));

        equal(response.status, 404);
        equal(response.bodyString(), "Page not found");

    });

    it("ordering - filters apply in order they are declared", async () => {
        const response = await get("/", async() => Res(200, "hello, world!"))
            .withFilter((handler) => async(req) => {
                return handler(req).then(response => response.replaceHeader("person", "tosh"));
            }).withFilter((handler) => async(req) => {
                return handler(req).then(response => response.replaceHeader("person", "bosh"));
            })
            .serve(new Request("GET", "/"));

        equal(response.header("person"), "bosh");
    });

    it("can add stuff to request using filters", async () => {
        const response = await get("/", async(req) => {
            return Res(200, req.header("pre-filter" || "hello, world!"));
        }).withFilter((handler) => async(req) => {
            return handler(req.withHeader("pre-filter", "hello from pre-filter"))
        })
            .serve(new Request("GET", "/"));

        equal(response.bodyString(), "hello from pre-filter");
    });

    it("exact match beats fuzzy match", async () => {
        const response = await get("/", async() => Res(200, "root"))
            .withHandler("GET", "/family/{name}", async() => Res(200, "fuzzy"))
            .withHandler("GET", "/family", async() => Res(200, "exact"))
            .withHandler("POST", "/family", async() => Res(200, "post"))
            .serve(new Request("GET", "/family"));

        equal(response.bodyString(), "exact");
    });

    it("Post redirect.", async () => {
        const friends = [];
        const routes = get("/", async () => Res(200, "root"))
            .withHandler("GET", "/family", async () => Res(200, friends.join(", ")))
            .withHandler("GET", "/family/{name}", async () => Res(200, "fuzzy"))
            .withHandler("POST", "/family", async (req) => {
                friends.push(req.form["name"]);
                Res(302).withHeader("Location", "/family");
            });

        const postSideEffect1 = routes.serve(new Request("POST", "/family", "name=tosh"));
        const postSideEffect2 = routes.serve(new Request("POST", "/family", "name=bosh"));
        const postSideEffect3 = routes.serve(new Request("POST", "/family", "name=losh"));

        const response = await routes.serve(new Request("GET", "/family"));
        equal(response.bodyString(), "tosh, bosh, losh");
    });

    it("extract form params", async () => {
        const response = await post("/family", async(req) => Res(200, req.form))
            .serve(Req("POST", "/family", "p1=1&p2=tom&p3=bosh&p4=losh")
                .withHeader("Content-Type", "application/x-www-form-urlencoded"));

        deepStrictEqual(response.bodyString(), {p1: "1", p2: "tom", p3: "bosh", p4: "losh"});
    });

    it("matches method by regex", async () => {
        const response = await routes(".*", "/", () => Promise.resolve(new Response(200, "matched")))
            .serve(new Request("GET", "/"));

        equal(response.bodyString(), "matched");
    });

    it("matches path by regex", async () => {
        const response = await routes(".*", ".*", async () => Res(200, "matched"))
            .serve(new Request("GET", "/any/path/matches"));

        equal(response.bodyString(), "matched");
    });

    it("more precise routing beats less precise", async () => {
        const response = await get("/", async() => Res(200, "root"))
            .withHandler("GET", "/family/{name}", async() => Res(200, "least precise"))
            .withHandler("GET", "/family/{name}/then/more", async() => Res(200, "most precise"))
            .withHandler("POST", "/family/{name}/less", async() => Res(200, "medium precise"))
            .serve(new Request("GET", "/family/shacham/then/more"));

        equal(response.bodyString(), "most precise");
    });

    it("withX convenience method", async () => {
        const response = await get("/", async() => Res())
            .withGet("/tom", async() => Res(200, "Hiyur"))
            .serve(Req("GET", "/tom"));

        equal(response.bodyString(), "Hiyur");
    });

});
