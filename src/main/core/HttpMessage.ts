import {Body} from "./Body";
import {Uri} from "./Uri";
import {Response} from "./Response";

export interface HttpMessage {
    headers: object;
    body: Body;
    uri: Uri;

    getHeader(name: string): string;

    setHeader(name: string, value: string): HttpMessage;

    replaceHeader(name: string, value: string): HttpMessage

    removeHeader(name: string): HttpMessage

    setBody(body: Body): HttpMessage

    bodyString(): string

}

export type HttpHandler = (Request) => Promise<Response>

export type Filter = (HttpHandler: HttpHandler) => HttpHandler

export enum Headers {
    //Request headers
    ACCEPT = "Accept",
    ACCEPT_ENCODING = "Accept-Encoding",
    ACCESS_CONTROL_REQUEST_METHOD = "Access-Control-Request-Method",
    ACCESS_CONTROL_REQUEST_HEADERS = "Access-Control-Request-Headers",
    AUTHORIZATION = "Authorization",
    CACHE_CONTROL = "Cache-Control",
    COOKIE = "Cookie",
    CONTENT_LENGTH = "Content-Length",
    CONTENT_TYPE = "Content-Type",
    FORWARDED = "Forwarded",
    HOST = "Host",
    REFERER = "Referer",
    USER_AGENT = "User-Agent",
    X_FORWARDED_FOR = "X-Forwarded-For",
    X_FORWARDED_Host = "X-Forwarded-Host",
    X_CSRF_TOKEN = "X-Csrf-Token",

    //Response headers
    ACCESS_CONTROL_ALLOW_ORIGIN = "Access-Control-Allow-Origin",
    ACCESS_CONTROL_ALLOW_CREDENTIALS = "Access-Control-Allow-Credentials",
    ACCESS_CONTROL_EXPOSE_HEADERS = "Access-Control-Expose-Headers",
    ACCESS_CONTROL_MAX_AGE = "Access-Control-Max-Age",
    ACCESS_CONTROL_ALLOW_METHODS = "Access-Control-Allow-Methods",
    ACCESS_CONTROL_ALLOW_HEADERS = "Access-Control-Allow-Headers",
    ETAG = "ETag",
    EXPIRES = "Expires",
    LAST_MODIFIED = "Last-Modified",
    LOCATION = "Location",
    SERVER = "Server",
    SET_COOKIE = "Set-Cookie",
    TRANSFER_ENCODING = "Transfer-Encoding",
    VARY = "Vary",
    WWW_AUTHENTICATE = "WWW-Authenticate",
}

export enum HeaderValues {
    APPLICATION_JSON = "application/json"

}

export enum Method {
    GET = "GET",
    POST = "POST",
    PUT = "PUT",
    PATCH = "PATCH",
    DELETE = "DELETE",
    OPTIONS = "OPTIONS",
    HEAD = "HEAD",
}