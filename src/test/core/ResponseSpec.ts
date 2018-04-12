import {deepEqual, equal, notEqual} from "assert";
import {Response} from "../../main/core/Response";

describe("in mem response", () => {

    it("is immutable", () => {
        const response1 = new Response(200, "OK");
        const response2 = response1.setHeader("tom", "tosh");

        notEqual(response1, response2);
    });

    it("set body", () => {
        equal(
            new Response()
                .setBody("body boy")
                .bodyString(),
            "body boy")
    });

    it("set body string", () => {
        equal(
            new Response()
                .setBody("body boy-o")
                .bodyString(),
            "body boy-o")
    });

    it("set header on response", () => {
        equal(
            new Response()
                .setHeader("tom", "smells")
                .getHeader("tom"),
            "smells");
    });

    it("concat same header on response", () => {
        deepEqual(
            new Response()
                .setHeader("tom", "smells")
                .setHeader("tom", "smells more")
                .setHeader("tom", "smells some more")
                .getHeader("tom"),
            ["smells", "smells more", "smells some more"]);
    });

    it('replace header', () => {
        equal(
            new Response()
                .setHeader("tom", "smells")
                .replaceHeader("tom", "is nice")
                .getHeader("tom"),
            "is nice");
    });

    it('remove header', () => {
        equal(
            new Response()
                .setHeader("tom", "smells")
                .removeHeader("tom")
                .getHeader("tom"),
            undefined);
    });

    it("can set body with just a string or a Body" , () => {
        equal(
            new Response(200, "some string made into a Body")
                .bodyString(),
            "some string made into a Body")
    });

});