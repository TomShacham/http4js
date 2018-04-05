let URI = require('url');

const pathParamMatchingRegex: RegExp = new RegExp(/\{(\w+)\}/g);
const pathParamCaptureTemplate: string = "([\\w\\s]+)";

export class Uri {
    path: string;
    protocol: string;
    auth: string;
    query: string;
    hostname: string;
    port: string;
    href: string;

    template: string;
    asNativeNodeRequest: object;

    matches: object = {};

    constructor(template: string) {
        let uri = URI.parse(template);

        this.asNativeNodeRequest = uri;
        this.template = uri.pathname;
        this.protocol = uri.protocol;
        this.auth = uri.auth;
        this.hostname = uri.hostname;
        this.path = uri.path;
        this.port = uri.port;
        this.query = uri.query;
        this.href = uri.href;
    }

    static of(uri: string): Uri {
        return new Uri(uri)
    }

    exactMatch(path: string): boolean {
        return new RegExp(`^${path}$`).exec(this.template) != null;
    }

    templateMatch(path: string): boolean {
        return this._uriTemplateToPathParamCapturingRegex().exec(path) != null;
    }

    extract(uri: string): Uri {
        let decodedUri = decodeURI(uri);
        let pathParamNames = this.template.match(pathParamMatchingRegex)
            .map(it => it.replace("{", "").replace("}", ""));
        let pathParams = this._uriTemplateToPathParamCapturingRegex().exec(decodedUri);
        pathParamNames.map( (name, i) => {
            this.matches[name] = pathParams[i+1]
        });
        return this;
    }

    pathParam(name: string): string {
        return this.matches[name];
    }

    withQuery(name: string, value: string): Uri {
        return this.query && this.query.length > 0
            ? Uri.of(this.href + `&${name}=${value}`)
            : Uri.of(this.href + `?${name}=${value}`);
    }

    withProtocol(protocol: string): Uri {
        this.protocol = protocol;
        return this;
    }

    private _uriTemplateToPathParamCapturingRegex (): RegExp {
        return new RegExp(this.template.replace(
            pathParamMatchingRegex,
            pathParamCaptureTemplate)
        );
    }
}