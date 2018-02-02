export class Uri {
    template: string;
    uriString: string;
    private matches: object = {};
    private pathParamMatchingRegex: RegExp = new RegExp(/\{(\w+)\}/);
    private pathParamCaptureTemplate: string = "([\\w\\s]+)";

    constructor(uri: string) {
        this.template = uri;
        this.uriString = encodeURI(uri);
    }

    static of (uri: string): Uri {
        return new Uri(uri)
    }

    match(path: string): boolean {
        let exec = this.uriTemplateToPathParamCapturingRegex().exec(path);
        console.log(exec)
        return exec == null;
    }

    extract (uri: string): Uri {
        let decoded = decodeURI(uri);
        let pathParamName = this.pathParamMatchingRegex.exec(this.template)[1];
        this.matches[pathParamName] = this.uriTemplateToPathParamCapturingRegex().exec(decoded)[1];
        return this;
    }

    pathParam(name: string): string {
        return this.matches[name];
    }

    private uriTemplateToPathParamCapturingRegex (): RegExp {
        return new RegExp(this.template.replace(
            this.pathParamMatchingRegex,
            this.pathParamCaptureTemplate)
        );
    }
}