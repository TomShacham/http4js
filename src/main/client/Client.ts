import * as http from 'http';
import {Response} from "../core/Response";
import {Request} from "../core/Request";
import {Body} from "../core/Body";

export function HttpClient(request: Request) {
    switch (request.method) {
        case "GET":
            return get(request);
        case "POST":
            return post(request);
        case "PUT":
            return put(request);
        case "PATCH":
            return patch(request);
        case "DELETE":
            return deleteRequest(request);
        case "HEAD":
            return head(request);
        case "OPTIONS":
            return options(request);
        case "TRACE":
            return trace(request);

        default:
            return get(request)

    }
}

function get(request: Request): Promise<Response> {
    let options = request.uri.asNativeNodeRequest;
    options['headers'] = request.headers;

    return new Promise(succ => {
        http.request(options, (res) => {
            let chunks = [];
            res.on('data', (chunk) => {
                chunks.push(chunk);
            });
            res.on('end', () => {
                let body = new Body(Buffer.concat(chunks));
                let response = new Response(res.statusCode, body).setHeaders(res.headers);
                return succ(response);
            });
        }).end();
    });
}

function post(request): Promise<Response> {
    let options = request.uri.asNativeNodeRequest;
    options['headers'] = request.headers;
    options.method = request.method;

    return new Promise(succ => {
        let clientRequest = http.request(options, (res) => {
            let chunks = [];
            res.on('data', (chunk) => {
                chunks.push(chunk);
            });
            res.on('end', () => {
                let body = new Body(Buffer.concat(chunks));
                let response = new Response(res.statusCode, body).setHeaders(res.headers);
                return succ(response);
            });
        });
        clientRequest.write(request.body.bodyString());
        clientRequest.end();
    });
}

function put(request): Promise<Response> {
    let options = request.uri.asNativeNodeRequest;
    options['headers'] = request.headers;
    options.method = request.method;

    return new Promise(succ => {
        let clientRequest = http.request(options, (res) => {
            let chunks = [];
            res.on('data', (chunk) => {
                chunks.push(chunk);
            });
            res.on('end', () => {
                let body = new Body(Buffer.concat(chunks));
                let response = new Response(res.statusCode, body).setHeaders(res.headers);
                return succ(response);
            });
        });
        clientRequest.write(request.body.bodyString());
        clientRequest.end();
    });
}

function patch(request): Promise<Response> {
    let options = request.uri.asNativeNodeRequest;
    options['headers'] = request.headers;
    options.method = request.method;

    return new Promise(succ => {
        let clientRequest = http.request(options, (res) => {
            let chunks = [];
            res.on('data', (chunk) => {
                chunks.push(chunk);
            });
            res.on('end', () => {
                let body = new Body(Buffer.concat(chunks));
                let response = new Response(res.statusCode, body).setHeaders(res.headers);
                return succ(response);
            });
        });
        clientRequest.write(request.body.bodyString());
        clientRequest.end();
    });
}

function deleteRequest(request): Promise<Response> {
    let options = request.uri.asNativeNodeRequest;
    options['headers'] = request.headers;
    options.method = request.method;

    return new Promise(succ => {
        let clientRequest = http.request(options, (res) => {
            let chunks = [];
            res.on('data', (chunk) => {
                chunks.push(chunk);
            });
            res.on('end', () => {
                let body = new Body(Buffer.concat(chunks));
                let response = new Response(res.statusCode, body).setHeaders(res.headers);
                return succ(response);
            });
        });
        clientRequest.write(request.body.bodyString());
        clientRequest.end();
    });
}

function head(request): Promise<Response> {
    let options = request.uri.asNativeNodeRequest;
    options['headers'] = request.headers;
    options.method = request.method;

    return new Promise(succ => {
        let clientRequest = http.request(options, (res) => {
            let chunks = [];
            res.on('data', (chunk) => {
                chunks.push(chunk);
            });
            res.on('end', () => {
                let body = new Body(Buffer.concat(chunks));
                let response = new Response(res.statusCode, body).setHeaders(res.headers);
                return succ(response);
            });
        });
        clientRequest.write(request.body.bodyString());
        clientRequest.end();
    });
}

function options(request): Promise<Response> {
    let options = request.uri.asNativeNodeRequest;
    options['headers'] = request.headers;
    options.method = request.method;

    return new Promise(succ => {
        let clientRequest = http.request(options, (res) => {
            let chunks = [];
            res.on('data', (chunk) => {
                chunks.push(chunk);
            });
            res.on('end', () => {
                let body = new Body(Buffer.concat(chunks));
                let response = new Response(res.statusCode, body).setHeaders(res.headers);
                return succ(response);
            });
        });
        clientRequest.write(request.body.bodyString());
        clientRequest.end();
    });
}

function trace(request): Promise<Response> {
    let options = request.uri.asNativeNodeRequest;
    options['headers'] = request.headers;
    options.method = request.method;

    return new Promise(succ => {
        let clientRequest = http.request(options, (res) => {
            let chunks = [];
            res.on('data', (chunk) => {
                chunks.push(chunk);
            });
            res.on('end', () => {
                let body = new Body(Buffer.concat(chunks));
                let response = new Response(res.statusCode, body).setHeaders(res.headers);
                return succ(response);
            });
        });
        clientRequest.write(request.body.bodyString());
        clientRequest.end();
    });
}
