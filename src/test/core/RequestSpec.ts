import * as assert from "assert";
import {equal, notEqual} from "assert";
import {Request} from "../../main/core/Request";
import {Headers, HeaderValues} from "../../main/core/Headers";
import {deepEqual} from "assert";

describe("in mem request", () => {

    it("is immutable", () => {
       const request1 = new Request("GET", "/");
       const request2 = request1.withHeader("tom", "tosh");

        notEqual(request1, request2);
    });

    it("set method is case insensitive", () => {
        equal(
            new Request("gEt", "/")
                .method,
            "GET")
    });

    it("set uri", () => {
        equal(
            new Request("GET", "/")
                .withUri("/tom")
                .uri
                .path(),
            "/tom")
    });

    it("set plain body", () => {
        equal(
            new Request("GET", "/")
                .withBody("body boy")
                .bodyString(),
            "body boy")
    });

    it("sets form field body on post", () => {
        equal(
            new Request("POST", "/")
                .withFormField("name", "tosh")
                .bodyString(),
            "name=tosh"
        )
    });

    it("sets many form fields body on post", () => {
        const formRequest = new Request("POST", "/")
            .withFormField("name", "tosh")
            .withFormField("age", "27");
        equal(formRequest.bodyString(), "name=tosh&age=27");
    });

    it("multiple same form fields lists all values", () => {
        const formRequest = new Request("POST", "/")
            .withFormField("name", "tosh")
            .withFormField("name", "bosh")
            .withFormField("name", "losh");
        equal(formRequest.bodyString(), "name=tosh&name=bosh&name=losh");
    });

    it("gives form field as list of strings", () => {
        const formRequest = new Request("POST", "/")
            .withFormField("name", ["tosh", "bosh"]);
        equal(formRequest.bodyString(), "name=tosh&name=bosh");
    });

    it("sets all form on post", () => {
        equal(
            new Request("POST", "/")
                .withForm({name: ["tosh", "bosh"], age: 27})
                .bodyString(),
            "name=tosh&name=bosh&age=27"
        )
    });

    it("sets form encoded header", () => {
        equal(
            new Request("POST", "/")
                .withForm({name: ["tosh", "bosh"], age: 27})
                .withFormField("name", "tosh")
                .header(Headers.CONTENT_TYPE),
            HeaderValues.FORM
        )
    });

    it("doesnt set form encoded header if content type header already set", () => {
        equal(
            new Request("POST", "/")
                .withHeader(Headers.CONTENT_TYPE, HeaderValues.MULTIPART_FORMDATA)
                .withForm({name: ["tosh", "bosh"], age: 27})
                .header(Headers.CONTENT_TYPE),
            HeaderValues.MULTIPART_FORMDATA
        )
    });

    it("set body string", () => {
        equal(
            new Request("GET", "/")
                .withBody("tommy boy")
                .bodyString(),
            "tommy boy")
    });

    it("sets query string", () => {
        equal(
            new Request("GET", "/tom")
                .withQuery("tom", "tosh")
                .withQuery("ben", "bosh")
                .uri
                .queryString(),
            "tom=tosh&ben=bosh")
    });

    it("decodes query string paramaters", () => {
        deepEqual(
            new Request("GET", "/tom")
                .withQuery("tom", "tosh%20eroo")
                .withQuery("ben", "bosh%2Aeroo")
                .queries,
            {tom: "tosh eroo", ben: "bosh*eroo"})
    });

    it("sets query string using object of key-values", () => {
        equal(
            new Request("GET", "/tom")
                .withQueries({tom: "tosh", ben: "bosh"})
                .uri
                .queryString(),
            "tom=tosh&ben=bosh")
    });

    it("get header is case insensitive", () => {
        equal(
            new Request("GET", "some/url")
                .withHeader("TOM", "rocks")
                .header("tom"),
            "rocks");
    });

    it("set header on request", () => {
        equal(
            new Request("GET", "some/url")
                .withHeader("tom", "smells")
                .header("tom"),
            "smells");
    });

    it("concat same header on request", () => {
        assert.deepEqual(
            new Request("GET", "some/url")
                .withHeader("tom", "smells")
                .withHeader("tom", "smells more")
                .withHeader("tom", "smells some more")
                .header("tom"),
            ["smells", "smells more", "smells some more"]);
    });

    it('replace header', () => {
        equal(
            new Request("GET", "some/url")
                .withHeader("tom", "smells")
                .replaceHeader("tom", "is nice")
                .header("tom"),
            "is nice");
    });

    it('remove header', () => {
        equal(
            new Request("GET", "some/url")
                .withHeader("tom", "smells")
                .removeHeader("tom")
                .header("tom"),
            undefined);
    })

});