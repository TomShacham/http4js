import {getTo} from "../../main/core/Routing";
import {Request} from "../../main/core/Request";
import {Response} from "../../main/core/Response";
import {Body} from "../../main/core/Body";
import {deepEqual, equal} from "assert";
import {HttpClient} from "../../main/client/Client";
import {NativeServer} from "../../main/servers/NativeServer";

describe("native node over the wire", () => {

    const baseUrl = "http://localhost:3000";

    const server = getTo("/", (req: Request) => {
        const query = req.getQuery("tomQuery");
        return new Promise(resolve => {
            resolve(
                new Response(200, new Body(req.bodyString()))
                    .setHeaders(req.headers)
                    .setHeader("tomQuery", query || "no tom query")
            )
        })
    })
        .withHandler("/post-body", "POST", (req) => {
            return new Promise(resolve => resolve(new Response(200, req.bodyString())));
        })
        .withHandler("/get", "GET", (req) => {
            return new Promise(resolve => resolve(new Response(200, "Done a GET request init?")));
        })
        .withHandler("/post", "POST", (req) => {
            return new Promise(resolve => resolve(new Response(200, "Done a POST request init?")));
        })
        .withHandler("/put", "PUT", (req) => {
            return new Promise(resolve => resolve(new Response(200, "Done a PUT request init?")));
        })
        .withHandler("/patch", "PATCH", (req) => {
            return new Promise(resolve => resolve(new Response(200, "Done a PATCH request init?")));
        })
        .withHandler("/delete", "DELETE", (req) => {
            return new Promise(resolve => resolve(new Response(200, "Done a DELETE request init?")));
        })
        .withHandler("/options", "OPTIONS", (req) => {
            return new Promise(resolve => resolve(new Response(200, "Done a OPTIONS request init?")));
        })
        .withHandler("/head", "HEAD", (req) => {
            return new Promise(resolve => resolve(new Response(200, "Done a HEAD request init?")));
        })
        .withHandler("/trace", "TRACE", (req) => {
            return new Promise(resolve => resolve(new Response(200, "Done a TRACE request init?")));
        })
        .asServer(new NativeServer(3000));


    before(() => {
        server.start();
    });

    after(() => {
        server.stop();
    });

    it("sets post body", () => {
        const request = new Request("POST", `${baseUrl}/post-body`, "my humps");
        return HttpClient(request)
            .then(succ => {
                equal(succ.bodyString(), "my humps")
            })
    });

    it("sets query params", () => {
        const request = new Request("GET", baseUrl)
            .setQuery("tomQuery", "likes to party");

        return HttpClient(request)
            .then(succ => {
                equal(succ.getHeader("tomquery"), "likes%20to%20party")
            })
    });

    it("sets multiple headers of same name", () => {
        const request = new Request("GET", baseUrl, null, {tom: ["smells", "smells more"]});
        return HttpClient(request)
            .then(succ => {
                deepEqual(succ.getHeader("tom"), "smells, smells more")
            })
    });

    describe("supports client verbs", () => {

        it("GET", () => {
            const request = new Request("GET", `${baseUrl}/get`);
            return HttpClient(request).then(response => {
                equal(response.bodyString(), "Done a GET request init?");
            });
        });

        it("POST", () => {
            const request = new Request("POST", `${baseUrl}/post`);
            return HttpClient(request).then(response => {
                equal(response.bodyString(), "Done a POST request init?");
            });
        });

        it("PUT", () => {
            const request = new Request("PUT", `${baseUrl}/put`);
            return HttpClient(request).then(response => {
                equal(response.bodyString(), "Done a PUT request init?");
            });
        });

        it("PATCH", () => {
            const request = new Request("PATCH", `${baseUrl}/patch`);
            return HttpClient(request).then(response => {
                equal(response.bodyString(), "Done a PATCH request init?");
            });
        });

        it("DELETE", () => {
            const request = new Request("DELETE", `${baseUrl}/delete`);
            return HttpClient(request).then(response => {
                equal(response.bodyString(), "Done a DELETE request init?");
            });
        });

        it("HEAD", () => {
            const request = new Request("HEAD", `${baseUrl}/head`);
            return HttpClient(request).then(response => {
                equal(response.status, "200");
            });
        });

        it("OPTIONS", () => {
            const request = new Request("OPTIONS", `${baseUrl}/options`);
            return HttpClient(request).then(response => {
                equal(response.bodyString(), "Done a OPTIONS request init?")
            });
        });

        it("TRACE", () => {
            const request = new Request("TRACE", `${baseUrl}/trace`);
            return HttpClient(request).then(response => {
                equal(response.bodyString(), "Done a TRACE request init?");
            });
        });

    })

});
