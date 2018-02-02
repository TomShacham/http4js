import * as assert from "assert";
import {equal} from "assert";
import {Request} from "../../main/core/Request";
import {Method} from "../../main/core/HttpMessage";
import {Body} from "../../main/core/Body";

describe("in mem request", () => {

    it("set uri", () => {
        equal(
            new Request(Method.GET, "/")
                .setUri("/tom")
                .uri
                .uriString,
            "/tom")
    });

    it("set body", () => {
        equal(
            new Request(Method.GET, "/")
                .setBody(new Body("body boy"))
                .bodyString(),
            "body boy")
    });

    it("set body string", () => {
        equal(
            new Request(Method.GET, "/")
                .setBodystring("tommy boy")
                .bodyString(),
            "tommy boy")
    });

    it("sets query string", () => {
        equal(
            new Request(Method.GET, "/tom")
                .query("tom", "tosh")
                .query("ben", "bosh")
                .uri
                .uriString,
            "/tom?tom=tosh&ben=bosh")
    });

    it("set header on request", () => {
        equal(
            new Request(Method.GET, "some/url")
                .setHeader("tom", "smells")
                .getHeader("tom"),
            "smells");
    });

    it("concat same header on request", () => {
        assert.deepEqual(
            new Request(Method.GET, "some/url")
                .setHeader("tom", "smells")
                .setHeader("tom", "smells more")
                .setHeader("tom", "smells some more")
                .getHeader("tom"),
            ["smells", "smells more", "smells some more"]);
    });

    it('replace header', () => {
        equal(
            new Request(Method.GET, "some/url")
                .setHeader("tom", "smells")
                .replaceHeader("tom", "is nice")
                .getHeader("tom"),
            "is nice");
    });

    it('remove header', () => {
        equal(
            new Request(Method.GET, "some/url")
                .setHeader("tom", "smells")
                .removeHeader("tom")
                .getHeader("tom"),
            undefined);
    })

});