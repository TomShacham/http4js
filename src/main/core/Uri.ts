let URI = require('url');

export class Uri {
    path: string;
    protocol: string;
    auth: string;
    query: string;
    hostname: string;
    port: string;

    template: string;
    uriString: string;
    private matches: object = {};
    private pathParamMatchingRegex: RegExp = new RegExp(/\{(\w+)\}/);
    private pathParamCaptureTemplate: string = "([\\w\\s]+)";

    constructor(uri: string) {
        this.template = uri;
        this.uriString = encodeURI(uri);

        let asRequest = this.asRequest();

        this.protocol = asRequest.protocol;
        this.auth = asRequest.auth;
        this.hostname = asRequest.hostname;
        this.path = asRequest.path;
        this.port = asRequest.port;
        this.query = asRequest.query;
    }

    static of (uri: string): Uri {
        return new Uri(uri)
    }

    match(path: string): boolean {
        let exec = this.uriTemplateToPathParamCapturingRegex().exec(path);
        return exec != null;
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

    asRequest() {
        return URI.parse(this.uriString);
    }

    private uriTemplateToPathParamCapturingRegex (): RegExp {
        return new RegExp(this.template.replace(
            this.pathParamMatchingRegex,
            this.pathParamCaptureTemplate)
        );
    }
}