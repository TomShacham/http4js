import {equal} from "assert";
import {TestApp} from "../TestApp";
import {Req} from "http4js/core/Request";

describe("unknown routes", () => {

    it("404 page if no routes match", async () => {
        let request = Req("GET", "/unknown-route");
        let testApp = new TestApp();

        const response = await testApp.serve(request);

        equal(response.status, 404);
        equal(response.bodyString(), "Page not found");
    });

});