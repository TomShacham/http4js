import {equal} from "assert";
import {Renderer} from "../../main/render/Renderer";

describe("rendering", () => {

    it("renders a template", () => {
        let rendered = new Renderer().render("src/test/resources/test.hbs");

        equal(rendered, "<h1>Welcome to Http4js!</h1>\n" +
            "<p>We like nice APIs!</p>")
    })

});