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
        .withHandler("/post-body", "POST", (req) => Promise.resolve(new Response(200, req.bodyString())))
        .withHandler("/post-form-body", "POST", (req) => Promise.resolve(new Response(200, JSON.stringify(req.form))))
        .withHandler("/get", "GET", () => Promise.resolve(new Response(200, "Done a GET request init?")))
        .withHandler("/post", "POST", () => Promise.resolve(new Response(200, "Done a POST request init?")))
        .withHandler("/put", "PUT", () => Promise.resolve(new Response(200, "Done a PUT request init?")))
        .withHandler("/patch", "PATCH", () => Promise.resolve(new Response(200, "Done a PATCH request init?")))
        .withHandler("/delete", "DELETE", () => Promise.resolve(new Response(200, "Done a DELETE request init?")))
        .withHandler("/options", "OPTIONS", () => Promise.resolve(new Response(200, "Done a OPTIONS request init?")))
        .withHandler("/head", "HEAD", () => Promise.resolve(new Response(200, "Done a HEAD request init?")))
        .withHandler("/trace", "TRACE", () => Promise.resolve(new Response(200, "Done a TRACE request init?")))
        .asServer(new NativeServer(3000));


    before(() => {
        server.start();
    });

    after(() => {
        server.stop();
    });

    it("sets post body", async() => {
        const request = new Request("POST", `${baseUrl}/post-body`, "my humps");
        const response = await HttpClient(request);
        equal(response.bodyString(), "my humps")
    });

    it("sets post form body", async() => {
        const request = new Request("POST", `${baseUrl}/post-form-body`).setForm({name: ["tosh", "bosh", "losh"]});
        const response = await HttpClient(request);
        equal(response.bodyString(), JSON.stringify({name: ["tosh", "bosh", "losh"]}))
    });

    it("sets query params", async() => {
        const request = new Request("GET", baseUrl).setQuery("tomQuery", "likes to party");
        const response = await HttpClient(request);
        equal(response.getHeader("tomquery"), "likes%20to%20party")
    });

    it("sets multiple headers of same name", async() => {
        const request = new Request("GET", baseUrl, null, {tom: ["smells", "smells more"]});
        const response = await HttpClient(request);
        deepEqual(response.getHeader("tom"), "smells, smells more")
    });

    describe("supports client verbs", () => {

        it("GET", async() => {
            const request = new Request("GET", `${baseUrl}/get`);
            const response = await HttpClient(request);
            equal(response.bodyString(), "Done a GET request init?");
        });

        it("POST", async() => {
            const request = new Request("POST", `${baseUrl}/post`);
            const response = await HttpClient(request);
            equal(response.bodyString(), "Done a POST request init?");
        });

        it("PUT", async() => {
            const request = new Request("PUT", `${baseUrl}/put`);
            const response = await HttpClient(request);
            equal(response.bodyString(), "Done a PUT request init?");
        });

        it("PATCH", async() => {
            const request = new Request("PATCH", `${baseUrl}/patch`);
            const response = await HttpClient(request);
            equal(response.bodyString(), "Done a PATCH request init?");
        });

        it("DELETE", async() => {
            const request = new Request("DELETE", `${baseUrl}/delete`);
            const response = await HttpClient(request);
            equal(response.bodyString(), "Done a DELETE request init?");
        });

        it("HEAD", async() => {
            const request = new Request("HEAD", `${baseUrl}/head`);
            const response = await HttpClient(request);
            equal(response.status, "200");
        });

        it("OPTIONS", async() => {
            const request = new Request("OPTIONS", `${baseUrl}/options`);
            const response = await HttpClient(request);
            equal(response.bodyString(), "Done a OPTIONS request init?")
        });

        it("TRACE", async() => {
            const request = new Request("TRACE", `${baseUrl}/trace`);
            const response = await HttpClient(request);
            equal(response.bodyString(), "Done a TRACE request init?");
        });

    })

});
