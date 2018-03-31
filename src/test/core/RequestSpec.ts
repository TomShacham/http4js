import * as assert from "assert";
import {equal} from "assert";
import {Request} from "../../main/core/Request";
import {Body} from "../../main/core/Body";

describe("in mem request", () => {

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
                .template,
            "/tom")
    });

    it("set body", () => {
        equal(
            new Request("GET", "/")
                .setBody("body boy")
                .bodyString(),
            "body boy")
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
                .query("tom", "tosh")
                .query("ben", "bosh")
                .uri
                .query,
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