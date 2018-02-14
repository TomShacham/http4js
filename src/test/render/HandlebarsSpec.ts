import {equal} from "assert";
import {Renderer} from "../../main/render/Renderer";

describe("rendering", () => {

    it("renders a template", () => {
        let rendered = new Renderer().render("src/test/resources/test.hbs");

        equal(rendered, "")
    })

});