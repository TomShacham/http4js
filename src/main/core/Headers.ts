export enum Headers {
    //Req headers
    ACCEPT = "Accept",
    ACCEPT_ENCODING = "Accept-Encoding",
    ACCESS_CONTROL_REQUEST_METHOD = "Access-Control-Req-Method",
    ACCESS_CONTROL_REQUEST_HEADERS = "Access-Control-Req-Headers",
    ALLOW = "Allow",
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

        //Res headers
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
