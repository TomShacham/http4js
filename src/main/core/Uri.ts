const URI = require('url');

const pathParamMatchingRegex: RegExp = new RegExp(/\{(\w+)\}/g);
const pathParamCaptureTemplate: string = "([\\w\\s]+)";

export interface NodeURI {
    protocol: string,
    auth: string,
    host: string, //have to change this to change hostname or port
    port: string,
    hostname: string,
    query: string,
    pathname: string,
    path: string, //path with query
    href: string //full url
}

export class Uri {
    template: string;
    asNativeNodeRequest: NodeURI;

    matches: object = {};

    constructor(template: string) {
        const uri = URI.parse(template);

        this.asNativeNodeRequest = uri;
        this.template = uri.pathname;
    }

    static of(uri: string): Uri {
        return new Uri(uri)
    }

    asUriString(): string {
        return URI.format(this.asNativeNodeRequest);
    }

    protocol() {
        return this.asNativeNodeRequest.protocol.replace(/\:/g, "");
    }

    withProtocol(protocol: string): Uri {
        const uri = Uri.clone(this);
        uri.asNativeNodeRequest.protocol = protocol;
        return Uri.of(uri.asUriString());
    }

    queryString(): string {
        return this.asNativeNodeRequest.query;
    }

    withQuery(name: string, value: string): Uri {
        if (this.queryString() && this.queryString().length > 0) {
            return Uri.of(`${this.asUriString()}&${name}=${value}`);
        } else {
            return Uri.of(`${this.asUriString()}?${name}=${value}`);
        }
    }

    path() {
        return this.asNativeNodeRequest.pathname;
    }

    withPath(path: string): Uri {
        const uri = Uri.clone(this);
        uri.asNativeNodeRequest.pathname = path;
        return Uri.of(uri.asUriString());
    }

    hostname() {
        return this.asNativeNodeRequest.hostname;
    }

    withHostname(hostname: string): Uri {
        const uri = Uri.clone(this);
        uri.asNativeNodeRequest.host = `${hostname}:${uri.asNativeNodeRequest.port}`;
        return Uri.of(uri.asUriString());
    }

    port() {
        return this.asNativeNodeRequest.port;
    }

    withPort(port: number): Uri {
        const uri = Uri.clone(this);
        uri.asNativeNodeRequest.host = `${uri.asNativeNodeRequest.hostname}:${port}`;
        return Uri.of(uri.asUriString());
    }

    auth() {
        return this.asNativeNodeRequest.auth;
    }

    withAuth(username: string, password: string): Uri {
        const uri = Uri.clone(this);
        uri.asNativeNodeRequest.auth = `${username}:${password}`;
        return Uri.of(uri.asUriString());
    }

    exactMatch(path: string): boolean {
        return new RegExp(`^${path}$`).exec(this.template) != null;
    }

    templateMatch(path: string): boolean {
        return this._uriTemplateToPathParamCapturingRegex().exec(path) != null;
    }

    extract(uri: string): Uri {
        const decodedUri = decodeURI(uri);
        const pathParamNames = this.template.match(pathParamMatchingRegex)
            .map(it => it.replace("{", "").replace("}", ""));
        const pathParams = this._uriTemplateToPathParamCapturingRegex().exec(decodedUri);
        pathParamNames.map( (name, i) => {
            this.matches[name] = pathParams[i+1]
        });
        return this;
    }

    pathParam(name: string): string {
        return this.matches[name];
    }

    private _uriTemplateToPathParamCapturingRegex (): RegExp {
        return new RegExp(this.template.replace(
            pathParamMatchingRegex,
            pathParamCaptureTemplate)
        );
    }

    private static clone(a) {
        return Object.assign(Object.create(a), a);
    }
}