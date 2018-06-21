import * as express from "express";
import {get} from "../../main/core/Routing";
import {ExpressServer} from "../../main/servers/ExpressServer";
import {HttpClient} from "../../main/client/Client";
import {Req} from "../../main/core/Req";
import {deepEqual, equal} from "assert";
import {ResOf} from "../../main";

const bodyParser = require('body-parser');


describe("express", async() => {

    const expressApp = express();
    expressApp.use(bodyParser.urlencoded({extended: true}));
    expressApp.use(bodyParser.json());

    expressApp.use((req, res, next) => {
        res.setHeader("express", "middleware");
        next();
    });

    const baseUrl = "http://localhost:3001";

    const server = get("/", async (req) => {
            const query = req.query("tomQuery");
            return ResOf(200, req.bodyString())
                .withHeaders(req.headers)
                .withHeader("tomQuery", query || "no tom query")
        })
        .withHandler("POST", "/post-body", async (req) => ResOf(200, req.bodyString()))
        .withHandler("POST", "/post-form-body", async (req) => ResOf(200, JSON.stringify(req.form)))
        .withHandler("GET", "/get", async () => ResOf(200, "Done a GET request init?"))
        .withHandler("POST", "/post", async () => ResOf(200, "Done a POST request init?"))
        .withHandler("PUT", "/put", async () => ResOf(200, "Done a PUT request init?"))
        .withHandler("PATCH", "/patch", async () => ResOf(200, "Done a PATCH request init?"))
        .withHandler("DELETE", "/delete", async () => ResOf(200, "Done a DELETE request init?"))
        .withHandler("OPTIONS", "/options", async () => ResOf(200, "Done a OPTIONS request init?"))
        .withHandler("HEAD", "/head", async () => ResOf(200, "Done a HEAD request init?"))
        .withHandler("TRACE", "/trace", async () => ResOf(200, "Done a TRACE request init?"))
        .asServer(new ExpressServer(expressApp, 3001));


    before(async() => {
        server.start();
    });

    after(async() => {
        server.stop();
    });

    it("respects middleware", async() => {
        let request = new Req("GET", baseUrl);
        const response = await HttpClient(request);
        equal(response.header("express"), "middleware")
    });

    it("sets post body", async() => {
        const request = new Req("POST", "http://localhost:3001/post-body", '{"result": "my humps"}', {"Content-Type": "application/json"});
        const response = await HttpClient(request);
        equal(JSON.parse(response.bodyString())["result"], "my humps");
    });

    it("sets post form body", async() => {
        const request = new Req("POST", `${baseUrl}/post-form-body`).withForm({name: ["tosh", "bosh", "losh"]});
        const response = await HttpClient(request);
        equal(response.bodyString(), JSON.stringify({name: ["tosh", "bosh", "losh"]}))
    });

    it("sets query params", async() => {
        const request = new Req("GET", baseUrl)
            .withQuery("tomQuery", "likes to party");

        const response = await HttpClient(request);
        equal(response.header("tomquery"), "likes to party")
    });

    it("sets multiple headers of same name", async() => {
        const request = new Req("GET", baseUrl, null, {tom: ["smells", "smells more"]});
        const response = await HttpClient(request);
        deepEqual(response.header("tom"), "smells, smells more")
    });

    describe("supports client verbs", async() => {

        it("GET", async() => {
            const request = new Req("GET", `${baseUrl}/get`);
            const response = await HttpClient(request);
            equal(response.bodyString(), "Done a GET request init?");
        });

        it("POST", async() => {
            const request = new Req("POST", `${baseUrl}/post`);
            const response = await HttpClient(request);
            equal(response.bodyString(), "Done a POST request init?");
        });

        it("PUT", async() => {
            const request = new Req("PUT", `${baseUrl}/put`);
            const response = await HttpClient(request);
            equal(response.bodyString(), "Done a PUT request init?");
        });

        it("PATCH", async() => {
            const request = new Req("PATCH", `${baseUrl}/patch`);
            const response = await HttpClient(request);
            equal(response.bodyString(), "Done a PATCH request init?");
        });

        it("DELETE", async() => {
            const request = new Req("DELETE", `${baseUrl}/delete`);
            const response = await HttpClient(request);
            equal(response.bodyString(), "Done a DELETE request init?");
        });

        it("HEAD", async() => {
            const request = new Req("HEAD", `${baseUrl}/head`);
            const response = await HttpClient(request);
            equal(response.status, "200");
        });

        it("OPTIONS", async() => {
            const request = new Req("OPTIONS", `${baseUrl}/options`);
            const response = await HttpClient(request);
            equal(response.bodyString(), "Done a OPTIONS request init?")
        });

        it("TRACE", async() => {
            const request = new Req("TRACE", `${baseUrl}/trace`);
            const response = await HttpClient(request);
            equal(response.bodyString(), "Done a TRACE request init?");
        });

    })

});
