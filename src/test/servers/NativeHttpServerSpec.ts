import {get} from "../../main/core/Routing";
import {Req} from "../../main/core/Req";
import {deepEqual, equal} from "assert";
import {HttpClient} from "../../main/client/HttpClient";
import {HeaderValues, ReqOf, ResOf} from "../../main";
import {Readable} from "stream";
import {Headers} from "../../main/core/Headers";
import {HttpServer} from "../../main/servers/NativeServer";

describe("native node over the wire", () => {

    const port = 4000;
    const baseUrl = "http://localhost:" + port;

    const server = get("/", async(req) => {
        const query = req.query("tomQuery");
        return ResOf(200, req.bodyString())
            .withHeaders(req.headers)
            .withHeader("tomQuery", query || "no tom query");
    })
        .withGet('/url', async(req: Req) => ResOf(200, req.uri.asUriString()))
        .withHandler("POST", "/post-body", async (req) => ResOf(200, req.bodyString()))
        .withHandler("POST", "/post-form-body", async (req) => ResOf(200, JSON.stringify(req.bodyForm())))
        .withHandler("POST", "/body-stream", async (req) => ResOf(200, req.bodyStream()!))
        .withHandler("GET", "/get", async () => ResOf(200, "Done a GET request init?"))
        .withHandler("POST", "/post", async () => ResOf(200, "Done a POST request init?"))
        .withHandler("PUT", "/put", async () => ResOf(200, "Done a PUT request init?"))
        .withHandler("PATCH", "/patch", async () => ResOf(200, "Done a PATCH request init?"))
        .withHandler("DELETE", "/delete", async () => ResOf(200, "Done a DELETE request init?"))
        .withHandler("OPTIONS", "/options", async () => ResOf(200, "Done a OPTIONS request init?"))
        .withHandler("HEAD", "/head", async () => ResOf(200, "Done a HEAD request init?"))
        .withHandler("TRACE", "/trace", async () => ResOf(200, "Done a TRACE request init?"))
        .asServer(HttpServer(port));

    before(() => {
        server.start();
    });

    after(() => {
        server.stop();
    });

    it("sets post body", async() => {
        const request = ReqOf("POST", `${baseUrl}/post-body`, "my humps");
        const response = await HttpClient(request);
        equal(response.bodyString(), "my humps");
    });

    it("sets post form body", async() => {
        const request = ReqOf("POST", `${baseUrl}/post-form-body`).withForm({name: ["tom shacham", "bosh", "losh"]});
        const response = await HttpClient(request);
        equal(response.bodyString(), JSON.stringify({name: ["tom shacham", "bosh", "losh"]}))
    });

    it('streams request body and responds with a bodyStream', async() => {
        const readable = new Readable({read(){}});
        readable.push('some body');
        readable.push(null);

        const request = ReqOf("POST", `${baseUrl}/body-stream`, readable);
        const response = await HttpClient(request);

        equal(response.header(Headers.TRANSFER_ENCODING), HeaderValues.CHUNKED);
        equal(response.bodyStream()!.read().toString('utf8'), 'some body');
    });

    it("sets query params", async() => {
        const request = ReqOf("GET", baseUrl).withQuery("tomQuery", "likes to party");
        const response = await HttpClient(request);
        equal(response.header("tomquery"), "likes to party")
    });

    it("sets multiple headers of same name", async() => {
        const request = ReqOf("GET", baseUrl, '', {tom: ["smells", "smells more"]});
        const response = await HttpClient(request);
        deepEqual(response.header("tom"), "smells, smells more")
    });

    it('sets the incoming req hostname and port', async () => {
        const request = ReqOf("GET", `${baseUrl}/url`);
        const response = await HttpClient(request);
        deepEqual(response.bodyString(), `http://localhost:${port}/url`)
    });

    it('ignores invalid hostname in host header', async () => {
        const invalidCharacters = '$£ * (';
        const request = ReqOf("GET", `${baseUrl}/url`)
            .withHeader('Host', `${invalidCharacters}`);
        const response = await HttpClient(request);
        deepEqual(response.bodyString(), `http://localhost:${port}/url`)
    });

    describe("supports client verbs", () => {

        it("GET", async() => {
            const request = ReqOf("GET", `${baseUrl}/get`);
            const response = await HttpClient(request);
            equal(response.bodyString(), "Done a GET request init?");
        });

        it("POST", async() => {
            const request = ReqOf("POST", `${baseUrl}/post`);
            const response = await HttpClient(request);
            equal(response.bodyString(), "Done a POST request init?");
        });

        it("PUT", async() => {
            const request = ReqOf("PUT", `${baseUrl}/put`);
            const response = await HttpClient(request);
            equal(response.bodyString(), "Done a PUT request init?");
        });

        it("PATCH", async() => {
            const request = ReqOf("PATCH", `${baseUrl}/patch`);
            const response = await HttpClient(request);
            equal(response.bodyString(), "Done a PATCH request init?");
        });

        it("DELETE", async() => {
            const request = ReqOf("DELETE", `${baseUrl}/delete`);
            const response = await HttpClient(request);
            equal(response.bodyString(), "Done a DELETE request init?");
        });

        it("HEAD", async() => {
            const request = ReqOf("HEAD", `${baseUrl}/head`);
            const response = await HttpClient(request);
            equal(response.status, "200");
        });

        it("OPTIONS", async() => {
            const request = ReqOf("OPTIONS", `${baseUrl}/options`);
            const response = await HttpClient(request);
            equal(response.bodyString(), "Done a OPTIONS request init?")
        });

        it("TRACE", async() => {
            const request = ReqOf("TRACE", `${baseUrl}/trace`);
            const response = await HttpClient(request);
            equal(response.bodyString(), "Done a TRACE request init?");
        });

    })

});
