import {KeyValues} from "./HttpMessage";
import {isNullOrUndefined} from "util";
import {Queries} from "./HttpMessage";
const URI = require('url');

const pathParamMatchingRegex: RegExp = new RegExp(/\{(\w+)\}/g);
const pathParamCaptureTemplate: string = "([\\w\\s\-\%]+)";

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
    matches: KeyValues = {};

    constructor(template: string) {
        this.asNativeNodeRequest = URI.parse(template);
    }

    static of(uri: string): Uri {
        const uriNoTrailingSlash = uri.endsWith('/') && uri !== "/" ? uri.slice(0, -1) : uri;
        return new Uri(uriNoTrailingSlash)
    }

    asUriString(): string {
        return URI.format(this.asNativeNodeRequest);
    }

    protocol(): string {
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
        ), this);
    }

    path(): string {
        return this.asNativeNodeRequest.pathname;
    }

    withPath(path: string): Uri {
        const uri = Uri.clone(this);
        uri.asNativeNodeRequest.pathname = path;
        return Uri.of(uri.asUriString());
    }

    hostname(): string {
        return this.asNativeNodeRequest.hostname;
    }

    withHostname(hostname: string): Uri {
        const uri = Uri.clone(this);
        uri.asNativeNodeRequest.host = `${hostname}:${uri.asNativeNodeRequest.port}`;
        return Uri.of(uri.asUriString());
    }

    port(): string {
        return this.asNativeNodeRequest.port;
    }

    withPort(port: number): Uri {
        const uri = Uri.clone(this);
        uri.asNativeNodeRequest.host = `${uri.asNativeNodeRequest.hostname}:${port}`;
        return Uri.of(uri.asUriString());
    }

    auth(): string {
        return this.asNativeNodeRequest.auth;
    }

    withAuth(username: string, password: string): Uri {
        const uri = Uri.clone(this);
        uri.asNativeNodeRequest.auth = `${username}:${password}`;
        return Uri.of(uri.asUriString());
    }

    exactMatch(matchingOnPath: string): boolean {
        return new RegExp(`^${matchingOnPath}$`).exec(this.path()) != null;
    }

    templateMatch(matchingOnPath: string): boolean {
        return Uri.uriTemplateToPathParamCapturingRegex(matchingOnPath).exec(this.path()) != null;
    }

    extract(uri: string): Uri {
        const path = this.path();
        const match = path.match(pathParamMatchingRegex) || [];
        const pathParamNames = match
            .map(it => it.replace("{", "").replace("}", ""));
        const pathParams: string[] = Uri.uriTemplateToPathParamCapturingRegex(path).exec(uri) || [];
        pathParamNames.map( (name, index) => {
            this.matches[name] = decodeURIComponent(pathParams[index + 1]);
        });
        return this;
    }

    pathParam(name: string): string {
        return this.matches[name];
    }

    private static uriTemplateToPathParamCapturingRegex(template: string): RegExp {
        return new RegExp(template.replace(
            pathParamMatchingRegex,
            pathParamCaptureTemplate)
        );
    }

    private static clone(a: {}) {
        return Object.assign(Object.create(a), a);
    }
}
