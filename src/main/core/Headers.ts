import {HeadersType} from "./HttpMessage";

export class Headers {
    private headers: HeadersType;

    constructor(headers: HeadersType) {
        this.headers = headers;
    }

    static of(headers: HeadersType): Headers {
        return new Headers(headers);
    }

    asObject(): HeadersType {
        return this.headers;
    }

    header(name: string): string {
        return this.headers[name.toLowerCase()];
    }

    withHeader(name: string, value: string): Headers {
        const headers: HeadersType = { ...this.asObject() };
        const lowercaseName = name.toLowerCase();
        if (headers[lowercaseName] == null) {
            headers[lowercaseName] = value;
        } else if (typeof headers[lowercaseName] === "string") {
            headers[lowercaseName] = [...headers[lowercaseName].split(', '), value].join(', ');
        }
        return Headers.of(headers);
    }

    withHeaders(headers: HeadersType): Headers {
        return Object.keys(headers).reduce((mergedHeaders: Headers, newHeaderKey: string) => {
            return mergedHeaders.withHeader(newHeaderKey, headers[newHeaderKey])
        }, this);
    }

    replaceHeader(name: string, value: string): Headers {
        const headers = { ...this.headers };
        headers[name.toLowerCase()] = value;
        return Headers.of(headers)
    }

    replaceAllHeaders(headers: HeadersType): Headers {
        return Headers.of(headers)
    }

    removeHeader(name: string): Headers {
        const headers = { ...this.headers };
        delete headers[name];
        return Headers.of(headers)
    }

    //Req headers
    static ACCEPT: string = "Accept";
    static ACCEPT_ENCODING: string = "Accept-Encoding";
    static ACCESS_CONTROL_REQUEST_METHOD: string = "Access-Control-Req-Method";
    static ACCESS_CONTROL_REQUEST_HEADERS: string = "Access-Control-Req-Headers";
    static ALLOW: string = "Allow";
    static AUTHORIZATION: string = "Authorization";
    static CACHE_CONTROL: string = "Cache-Control";
    static COOKIE: string = "Cookie";
    static CONTENT_LENGTH: string = "Content-Length";
    static CONTENT_TYPE: string = "Content-Type";
    static FORWARDED: string = "Forwarded";
    static HOST: string = "Host";
    static REFERER: string = "Referer";
    static USER_AGENT: string = "User-Agent";
    static X_FORWARDED_FOR: string = "X-Forwarded-For";
    static X_FORWARDED_Host: string = "X-Forwarded-Host";
    static X_CSRF_TOKEN: string = "X-Csrf-Token";

        //Res headers
    static ACCESS_CONTROL_ALLOW_ORIGIN: string = "Access-Control-Allow-Origin";
    static ACCESS_CONTROL_ALLOW_CREDENTIALS: string = "Access-Control-Allow-Credentials";
    static ACCESS_CONTROL_EXPOSE_HEADERS: string = "Access-Control-Expose-Headers";
    static ACCESS_CONTROL_MAX_AGE: string = "Access-Control-Max-Age";
    static ACCESS_CONTROL_ALLOW_METHODS: string = "Access-Control-Allow-Methods";
    static ACCESS_CONTROL_ALLOW_HEADERS: string = "Access-Control-Allow-Headers";
    static ETAG: string = "ETag";
    static EXPIRES: string = "Expires";
    static LAST_MODIFIED: string = "Last-Modified";
    static LOCATION: string = "Location";
    static SERVER: string = "Server";
    static SET_COOKIE: string = "Set-Cookie";
    static TRANSFER_ENCODING: string = "Transfer-Encoding";
    static VARY: string = "Vary";
    static WWW_AUTHENTICATE: string = "WWW-Authenticate";
}

export enum HeaderValues {

    // Req
    APPLICATION_JSON = "application/json",
    CACHE_CONTROL_MAX_STALE = "max-stale=",
    CACHE_CONTROL_MIN_FRESH = "min-fresh=",
    CACHE_CONTROL_ONLY_IF_CACHED = "only-if-cached",
    CHUNKED = "chunked",
    FORM = "application/x-www-form-urlencoded",
    TEXT_PLAIN = "text/plain",
    TEXT_HTML = "text/html",
    MULTIPART_FORMDATA = "multipart/form-data",
    IMAGE_JPG = "image/jpg",
    IMAGE_PNG = "image/png",
    AUDIO_MPEG = "audio/mpeg",
    VIDEO_MP4 = "video/mp4",

    // Res
    CACHE_CONTROL_OFF = "no-cache, no-store, must-revalidate",
    CACHE_CONTROL_MUST_REVALIDATE = "must-revalidate",
    CACHE_CONTROL_PUBLIC = "public",
    CACHE_CONTROL_PRIVATE = "private",
    CACHE_CONTROL_PROXY_REVALIDATE = "proxy-revalidate",
    CACHE_CONTROL_S_MAX_AGE = "s-maxage=",
    CACHE_CONTROL_IMMUTABLE = "immutable",
    CACHE_CONTROL_STALE_WHILE_REVALIDATE = "stale-while-revalidate=",
    CACHE_CONTROL_STALE_IF_ERROR = "stale-if-error=",

    // Req and Res
    CACHE_CONTROL_NO_CACHE = "no-cache",
    CACHE_CONTROL_NO_STORE = "no-store",
    CACHE_CONTROL_MAX_AGE = "max-age=",
    CACHE_CONTROL_NO_TRANSFORM = "no-transform"

    /*
     see https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control
     */

}
