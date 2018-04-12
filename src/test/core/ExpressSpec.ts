import * as express from "express";
import {getTo} from "../../main/core/Routing";
import {Response} from "../../main/core/Response";
import {ExpressServer} from "../../main/servers/ExpressServer";
import {HttpClient} from "../../main/client/Client";
import {Request} from "../../main/core/Request";
import {Body} from "../../main/core/Body";
import {equal} from "assert";
import {deepEqual} from "assert";
const bodyParser = require('body-parser');


describe("express", () => {

    let expressApp = express();
    expressApp.use(bodyParser.urlencoded({extended: true}));
    expressApp.use(bodyParser.json());

    expressApp.use((req, res, next) => {
        res.setHeader("express", "middleware");
        next();
    });

    let baseUrl = "http://localhost:3001";

    let server = getTo("/", (req: Request) => {
        let query = req.getQuery("tomQuery");
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
        .asServer(new ExpressServer(expressApp, 3001));


    before(() => {
        server.start();
    });

    after(() => {
        server.stop();
    });

    it("respects middleware", () => {
        return HttpClient(new Request("GET", baseUrl))
            .then(succ => {
                equal(succ.getHeader("express"), "middleware")
            })
    });

    it("sets post body", () => {
        let request = new Request("POST", "http://localhost:3001/post-body", '{"result": "my humps"}', {"Content-Type": "application/json"});
        return HttpClient(request)
            .then(succ => {
                equal(JSON.parse(succ.bodyString())["result"], "my humps");
            })
    });

    it("sets query params", () => {
        let request = new Request("GET", baseUrl)
            .setQuery("tomQuery", "likes to party");

        return HttpClient(request)
            .then(succ => {
                equal(succ.getHeader("tomquery"), "likes%20to%20party")
            })
    });

    it("sets multiple headers of same name", () => {
        let request = new Request("GET", baseUrl, null, {tom: ["smells", "smells more"]});
        return HttpClient(request)
            .then(succ => {
                deepEqual(succ.getHeader("tom"), "smells, smells more")
            })
    });

    describe("supports client verbs", () => {

        it("GET", () => {
            let request = new Request("GET", `${baseUrl}/get`);
            return HttpClient(request).then(response => {
                equal(response.bodyString(), "Done a GET request init?");
            });
        });

        it("POST", () => {
            let request = new Request("POST", `${baseUrl}/post`);
            return HttpClient(request).then(response => {
                equal(response.bodyString(), "Done a POST request init?");
            });
        });

        it("PUT", () => {
            let request = new Request("PUT", `${baseUrl}/put`);
            return HttpClient(request).then(response => {
                equal(response.bodyString(), "Done a PUT request init?");
            });
        });

        it("PATCH", () => {
            let request = new Request("PATCH", `${baseUrl}/patch`);
            return HttpClient(request).then(response => {
                equal(response.bodyString(), "Done a PATCH request init?");
            });
        });

        it("DELETE", () => {
            let request = new Request("DELETE", `${baseUrl}/delete`);
            return HttpClient(request).then(response => {
                equal(response.bodyString(), "Done a DELETE request init?");
            });
        });

        it("HEAD", () => {
            let request = new Request("HEAD", `${baseUrl}/head`);
            return HttpClient(request).then(response => {
                equal(response.status, "200");
            });
        });

        it("OPTIONS", () => {
            let request = new Request("OPTIONS", `${baseUrl}/options`);
            return HttpClient(request).then(response => {
                equal(response.bodyString(), "Done a OPTIONS request init?")
            });
        });

        it("TRACE", () => {
            let request = new Request("TRACE", `${baseUrl}/trace`);
            return HttpClient(request).then(response => {
                equal(response.bodyString(), "Done a TRACE request init?");
            });
        });

    })

});
