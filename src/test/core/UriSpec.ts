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
            "is the sugar"
        )
    });

    it("matches paths", () => {
        equal(Uri.of("/tom/{is}/goodness")
                .match("/tom/is the sugar/goodness/gracious/me"),
            true
        )

    });

});