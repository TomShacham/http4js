import {deepEqual, equal, notEqual} from "assert";
import {Response, Redirect} from "../../main/core/Response";

describe("in mem response", () => {

    it("is immutable", () => {
        const response1 = new Response(200, "OK");
        const response2 = response1.withHeader("tom", "tosh");

        notEqual(response1, response2);
    });

    it("set body", () => {
        equal(
            new Response()
                .withBody("body boy")
                .bodyString(),
            "body boy")
    });

    it("set body string", () => {
        equal(
            new Response()
                .withBody("body boy-o")
                .bodyString(),
            "body boy-o")
    });

    it("set header on response", () => {
        equal(
            new Response()
                .withHeader("tom", "smells")
                .header("tom"),
            "smells");
    });

    it("concat same header on response", () => {
        deepEqual(
            new Response()
                .withHeader("tom", "smells")
                .withHeader("tom", "smells more")
                .withHeader("tom", "smells some more")
                .header("tom"),
            ["smells", "smells more", "smells some more"]);
    });

    it('replace header', () => {
        equal(
            new Response()
                .withHeader("tom", "smells")
                .replaceHeader("tom", "is nice")
                .header("tom"),
            "is nice");
    });

    it('remove header', () => {
        equal(
            new Response()
                .withHeader("tom", "smells")
                .removeHeader("tom")
                .header("tom"),
            undefined);
    });

    it("can set body with just a string or a Body" , () => {
        equal(
            new Response(200, "some string made into a Body")
                .bodyString(),
            "some string made into a Body")
    });

    it("Redirect is sugar for Response withHeader Location", () => {
        equal(Redirect(302, "/tosh").header("Location"),
            "/tosh"
        )
    })

});