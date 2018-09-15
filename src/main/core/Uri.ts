import {KeyValues} from "./HttpMessage";
import {isNullOrUndefined} from "util";
import {Queries} from "./HttpMessage";
const URI = require('url');

export interface NodeURI {
    protocol: string,
    auth: string,
    host: string, //have to change this to change hostname or port
    port: string,
    hostname: string,
    query: string,
    pathname: string,
    path: string, //pathname with query
}

export class Uri {
    asNativeNodeRequest: NodeURI;
    matches: KeyValues;
    private pathParamMatchingRegex: RegExp = new RegExp(/\{(\w+)\}/g);
    private pathParamCaptureTemplate: string = "([\\w\\s\-\%]+)";


    constructor(template: string, matches: KeyValues = {}) {
        this.asNativeNodeRequest = URI.parse(template);
        this.matches = matches;
    }

    static of(uri: string, matches: KeyValues = {}): Uri {
        const uriNoTrailingSlash = uri.endsWith('/') && uri !== "/" ? uri.slice(0, -1) : uri;
        return new Uri(uriNoTrailingSlash, matches)
    }

    asUriString(): string {
        return URI.format(this.asNativeNodeRequest);
    }

    protocol(): string {
        return this.asNativeNodeRequest.protocol.replace(/\:/g, "");
    }

    withProtocol(protocol: string): Uri {
        this.asNativeNodeRequest.protocol = protocol;
        return Uri.of(this.asUriString());
    }

    queryString(): string {
        return this.asNativeNodeRequest.query;
    }

    queryParams(): Queries {
        const queries: Queries = {};
        if (isNullOrUndefined(this.queryString())) return queries;
        const pairs = this.queryString().split("&");
        pairs.map(pair => {
            const split = pair.split("=");
            const name = split[0];
            let value;
            try {
                value = decodeURIComponent(split[1]);
            } catch (e) {
                value = 'Malformed URI component';
            }
            if (queries[name]) {
                queries[name] = typeof queries[name] === 'string'
                    ? [queries[name] as string, value as string]
                    : [...queries[name] as string[], value as string];
            } else {
                queries[name] = value;
            }
        });
        return queries;
    }

    withQuery(name: string, value: string): Uri {
        if (this.queryString() && this.queryString().length > 0) {
            return Uri.of(`${this.asUriString()}&${name}=${value}`);
        } else {
            return Uri.of(`${this.asUriString()}?${name}=${value}`);
        }
    }

    withQueries(queries: KeyValues): Uri {
        return Object.keys(queries).reduce((uri :Uri, queryName: string) => (
            uri.withQuery(queryName, queries[queryName])
        ), Uri.of(this.asUriString()));
    }

    path(): string {
        return this.asNativeNodeRequest.pathname;
    }

    withPath(path: string): Uri {
        this.asNativeNodeRequest.pathname = path;
        return Uri.of(this.asUriString());
    }

    hostname(): string {
        return this.asNativeNodeRequest.hostname;
    }

    withHostname(hostname: string): Uri {
        this.asNativeNodeRequest.host = `${hostname}:${this.asNativeNodeRequest.port}`;
        return Uri.of(this.asUriString());
    }

    port(): string {
        return this.asNativeNodeRequest.port;
    }

    withPort(port: number): Uri {
        this.asNativeNodeRequest.host = `${this.asNativeNodeRequest.hostname}:${port}`;
        return Uri.of(this.asUriString());
    }

    auth(): string {
        return this.asNativeNodeRequest.auth;
    }

    withAuth(username: string, password: string): Uri {
        this.asNativeNodeRequest.auth = `${username}:${password}`;
        return Uri.of(this.asUriString());
    }

    pathParam(name: string): string {
        return this.matches[name];
    }

    exactMatch(matchingOnPath: string): boolean {
        return new RegExp(`^${matchingOnPath}$`).exec(this.path()) != null;
    }

    templateMatch(matchingOnPath: string): boolean {
        return this.uriTemplateToPathParamCapturingRegex(matchingOnPath).exec(this.path()) != null;
    }

    extract(uri: string): Uri {
        const matches: KeyValues = {};
        const path = this.path();
        const match = path.match(this.pathParamMatchingRegex) || [];
        const pathParamNames = match.map(it => it.replace(/{|}/g, ''));
        const pathParams: string[] = this.uriTemplateToPathParamCapturingRegex(path).exec(uri) || [];
        pathParamNames.map( (name, index) => matches[name] = decodeURIComponent(pathParams[index + 1]));
        return Uri.of(this.asUriString(), matches);
    }

private uriTemplateToPathParamCapturingRegex(template: string): RegExp {
        return new RegExp(template.replace(
            this.pathParamMatchingRegex,
            this.pathParamCaptureTemplate)
        );
    }

}
