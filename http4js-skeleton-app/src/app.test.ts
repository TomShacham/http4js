import {equal} from "assert";
import {App} from "./app";
import {Method} from "http4js/dist/core/Methods";
import {Request} from "http4js/dist/core/Request";
import {NativeServer} from "http4js/dist/servers/NativeServer";
import {HttpClient} from "http4js/dist/client/Client";

describe("hello world", () => {

    const testApp = new App();

    it("responds 200 ok", async() => {
        const response = await testApp.serve(new Request(Method.GET, "/hello"));
        equal(response.status, 200);
        equal(response.bodyString(), "Hello, world!");
    });

    it("times requests", async () => {
        const response = await testApp.serve(new Request(Method.GET, "/hello"));
        equal(parseInt(response.header("Total-time")) < 10, true);
    });

    it("responds 404 for unknown route", async () => {
        const response = await testApp.serve(new Request(Method.GET, "/unknown"));
        equal(response.bodyString(), "GET to /unknown did not match routes");
    });

    it("starts up", async () => {
        const app = testApp.routes().asServer(new NativeServer(3000));
        app.start();
        const response = await HttpClient(new Request(Method.GET, "http://localhost:3000/hello"));
        equal(response.status, 200);
        equal(response.bodyString(), "Hello, world!");
        app.stop();
    });

});