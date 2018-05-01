import * as assert from "assert";
import {equal, notEqual} from "assert";
import {Request} from "../../main/core/Request";
import {Headers, HeaderValues} from "../../main/core/Headers";

describe("in mem request", () => {

    it("is immutable", () => {
       const request1 = new Request("GET", "/");
       const request2 = request1.setHeader("tom", "tosh");

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
                .setUri("/tom")
                .uri
                .path(),
            "/tom")
    });

    it("set plain body", () => {
        equal(
            new Request("GET", "/")
                .setBody("body boy")
                .bodyString(),
            "body boy")
    });

    it("sets form field body on post", () => {
        equal(
            new Request("POST", "/")
                .setFormField("name", "tosh")
                .bodyString(),
            "name=tosh"
        )
    });

    it("sets many form fields body on post", () => {
        const formRequest = new Request("POST", "/")
            .setFormField("name", "tosh")
            .setFormField("age", "27");
        equal(formRequest.bodyString(), "name=tosh&age=27");
    });

    it("multiple same form fields lists all values", () => {
        const formRequest = new Request("POST", "/")
            .setFormField("name", "tosh")
            .setFormField("name", "bosh")
            .setFormField("name", "losh");
        equal(formRequest.bodyString(), "name=tosh&name=bosh&name=losh");
    });

    it("gives form field as list of strings", () => {
        const formRequest = new Request("POST", "/")
            .setFormField("name", ["tosh", "bosh"]);
        equal(formRequest.bodyString(), "name=tosh&name=bosh");
    });

    it("sets all form on post", () => {
        equal(
            new Request("POST", "/")
                .setForm({name: ["tosh", "bosh"], age: 27})
                .bodyString(),
            "name=tosh&name=bosh&age=27"
        )
    });

    it("sets form encoded header", () => {
        equal(
            new Request("POST", "/")
                .setForm({name: ["tosh", "bosh"], age: 27})
                .setFormField("name", "tosh")
                .getHeader(Headers.CONTENT_TYPE),
            HeaderValues.FORM
        )
    });

    it("doesnt set form encoded header if content type header already set", () => {
        equal(
            new Request("POST", "/")
                .setHeader(Headers.CONTENT_TYPE, HeaderValues.MULTIPART_FORMDATA)
                .setForm({name: ["tosh", "bosh"], age: 27})
                .getHeader(Headers.CONTENT_TYPE),
            HeaderValues.MULTIPART_FORMDATA
        )
    });

    it("set body string", () => {
        equal(
            new Request("GET", "/")
                .setBody("tommy boy")
                .bodyString(),
            "tommy boy")
    });

    it("sets query string", () => {
        equal(
            new Request("GET", "/tom")
                .setQuery("tom", "tosh")
                .setQuery("ben", "bosh")
                .uri
                .queryString(),
            "tom=tosh&ben=bosh")
    });

    it("get header is case insensitive", () => {
        equal(
            new Request("GET", "some/url")
                .setHeader("TOM", "rocks")
                .getHeader("tom"),
            "rocks");
    });

    it("set header on request", () => {
        equal(
            new Request("GET", "some/url")
                .setHeader("tom", "smells")
                .getHeader("tom"),
            "smells");
    });

    it("concat same header on request", () => {
        assert.deepEqual(
            new Request("GET", "some/url")
                .setHeader("tom", "smells")
                .setHeader("tom", "smells more")
                .setHeader("tom", "smells some more")
                .getHeader("tom"),
            ["smells", "smells more", "smells some more"]);
    });

    it('replace header', () => {
        equal(
            new Request("GET", "some/url")
                .setHeader("tom", "smells")
                .replaceHeader("tom", "is nice")
                .getHeader("tom"),
            "is nice");
    });

    it('remove header', () => {
        equal(
            new Request("GET", "some/url")
                .setHeader("tom", "smells")
                .removeHeader("tom")
                .getHeader("tom"),
            undefined);
    })

});