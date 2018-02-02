import {equal} from "assert";
import {Uri} from "../../main/core/Uri";

describe("uri", () => {

    it("encodes uris", () => {
        equal(
            Uri.of("/tom/is the sugar/goodness").uriString,
            "/tom/is%20the%20sugar/goodness");
    });

    it("extracts path params", () => {
        equal(Uri.of("/tom/{is}/goodness")
                .extract("/tom/is the sugar/goodness")
            .pathParam("is"),
            "is the sugar")
    });

    it("matches paths", () => {
        equal(Uri.of("/tom/{is}/goodness")
                .match("/tom/is the sugar/goodness/gracious/me"),
            true)
    });

    it("matches false when paths different", () => {
        equal(Uri.of("/tom/{is}/goodness")
                .match("/tom/is/badness"),
            false)
    });

    it("parses out the path from uri string", () => {
        equal(
            Uri.of("http://localhost:3000/").path,
            "/");
        equal(
            Uri.of("http://localhost:3000/tom/is the hot sauce/guy").path,
            "/tom/is%20the%20hot%20sauce/guy");
    });

    it("parses out the scheme from uri string", () => {
        equal(
            Uri.of("http://localhost:3000/").protocol,
            "http:");
    });

    it("parses out the query from uri string", () => {
        equal(
            Uri.of("http://localhost:3000/?tom=foo&ben=bar").query,
            "tom=foo&ben=bar");
    });

});