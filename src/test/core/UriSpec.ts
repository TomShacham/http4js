import {equal} from "assert";

describe("uri", () => {

    it("encodes uris", () => {
        equal(
            Uri.of("/tom/is the sugar/goodness")
                .template,
            "/tom/is%20the%20sugar/goodness");
    });

    it("extracts path params", () => {
        equal(Uri.of("/tom/{is}/goodness")
                .extract("/tom/is the sugar/goodness")
            .pathParam("is"),
            "is the sugar"
        )
    })

});

export class Uri {
    template: string;
    private matches: object = {};
    private uri: string;
    private pathParamMatchingRegex: RegExp = new RegExp(/\{(\w+)\}/);
    private pathParamCaptureTemplate: string = "([\\w\\s]+)";

    constructor(uri: string) {
        this.template = uri;
        this.uri = encodeURI(uri);
    }

    static of (uri: string): Uri {
        return new Uri(uri)
    }

    extract (uri: string): Uri {
        let decoded = decodeURI(uri);
        let templateName = this.pathParamMatchingRegex.exec(this.template)[1];
        this.matches[templateName] = this.uriTemplateToRegex().exec(decoded)[1];
        return this;
    }

    pathParam(name: string): string {
        return this.matches[name];
    }

    private uriTemplateToRegex (): RegExp {
        return new RegExp(this.template.replace(
            this.pathParamMatchingRegex,
            this.pathParamCaptureTemplate)
        );
    }
}