let URI = require('url');

export class Uri {
    path: string;
    protocol: string;
    auth: string;
    query: string;
    hostname: string;
    port: string;
    href: string;

    template: string;
    asRequest: object;

    private matches: object = {};
    private pathParamMatchingRegex: RegExp = new RegExp(/\{(\w+)\}/);
    private pathParamCaptureTemplate: string = "([\\w\\s]+)";

    constructor(template: string) {
        let uri = URI.parse(template);

        this.asRequest = uri;
        this.template = uri.pathname;
        this.protocol = uri.protocol;
        this.auth = uri.auth;
        this.hostname = uri.hostname;
        this.path = uri.path;
        this.port = uri.port;
        this.query = uri.query;
        this.href = uri.href;
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

    withQuery(name: string, value: string): Uri {
        if (this.query && this.query.length > 0){
            return Uri.of(this.href + `&${name}=${value}`)
        } else {
            return Uri.of(this.href + `?${name}=${value}`)
        }
    }

    private uriTemplateToPathParamCapturingRegex (): RegExp {
        return new RegExp(this.template.replace(
            this.pathParamMatchingRegex,
            this.pathParamCaptureTemplate)
        );
    }
}