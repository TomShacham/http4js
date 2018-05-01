import {equal} from "assert";
import {Uri} from "../../main/core/Uri";
import {notEqual} from "assert";

describe("uri", () => {

    it("encodes uris", () => {
        equal(
            Uri.of("/tom/is the sugar/goodness").template,
            "/tom/is%20the%20sugar/goodness");
    });

    it("extracts path params", () => {
        equal(Uri.of("/tom/{is}/goodness")
                .extract("/tom/the sugar/goodness")
            .pathParam("is"),
            "the sugar")
    });

    it("matches paths", () => {
        equal(Uri.of("/tom/{is}/goodness")
                .templateMatch("/tom/is the sugar/goodness/gracious/me"),
            true)
    });

    it("matches false when paths different", () => {
        equal(Uri.of("/tom/{is}/goodness")
                .templateMatch("/tom/is/badness"),
            false)
    });

    it("parses out the path from uri string", () => {
        equal(
            Uri.of("http://localhost:3000/").path(),
            "/");
        equal(
            Uri.of("http://localhost:3000/tom/is the hot sauce/guy").path(),
            "/tom/is%20the%20hot%20sauce/guy");
    });

    it("parses out the protocol from uri string", () => {
        equal(
            Uri.of("http://localhost:3000/").protocol(),
            "http");
    });

    it("parses out the query from uri string", () => {
        equal(
            Uri.of("http://localhost:3000/?tom=foo&ben=bar").queryString(),
            "tom=foo&ben=bar");
    });

    it("parses out the hostname from uri string", () => {
        equal(
            Uri.of("http://localhost:3000/?tom=foo&ben=bar").hostname(),
            "localhost");
    });

    it("parses out the port from uri string", () => {
        equal(
            Uri.of("http://localhost:3000/?tom=foo&ben=bar").port(),
            "3000");
    });

    it("parses out the auth from uri string", () => {
        equal(
            Uri.of("http://tom:tom1@localhost:3000/?tom=foo&ben=bar").auth(),
            "tom:tom1");
    });

    it("gives you a new Uri with new path", () => {
        const initial = Uri.of("http://localhost:3000/?tom=foo&ben=bar");
        const newPath = initial.withPath("/tosh");
        notEqual(initial, newPath);
        equal(newPath.asUriString(), "http://localhost:3000/tosh?tom=foo&ben=bar")
    });

    it("gives you a new Uri with new protocol", () => {
        const initial = Uri.of("http://localhost:3000/?tom=foo&ben=bar");
        const newPath = initial.withProtocol("https");
        notEqual(initial, newPath);
        equal(newPath.asUriString(), "https://localhost:3000/?tom=foo&ben=bar")
    });

    it("gives you a new Uri with new query", () => {
        const initial = Uri.of("http://localhost:3000/?tom=foo&ben=bar");
        const newPath = initial.withQuery("bosh", "NYC");
        notEqual(initial, newPath);
        equal(newPath.asUriString(), "http://localhost:3000/?tom=foo&ben=bar&bosh=NYC")
    });

    it("gives you a new Uri with new hostname", () => {
        const initial = Uri.of("http://localhost:3000/?tom=foo&ben=bar");
        const newPath = initial.withHostname("focalhost");
        notEqual(initial, newPath);
        equal(newPath.asUriString(), "http://focalhost:3000/?tom=foo&ben=bar")
    });

    it("gives you a new Uri with new port", () => {
        const initial = Uri.of("http://localhost:3000/?tom=foo&ben=bar");
        const newPath = initial.withPort(3001);
        notEqual(initial, newPath);
        equal(newPath.asUriString(), "http://localhost:3001/?tom=foo&ben=bar")
    });

    it("gives you a new Uri with new auth", () => {
        const initial = Uri.of("http://localhost:3000/?tom=foo&ben=bar");
        const newPath = initial.withAuth("tom", "password");
        notEqual(initial, newPath);
        equal(newPath.asUriString(), "http://tom:password@localhost:3000/?tom=foo&ben=bar")
    });

});