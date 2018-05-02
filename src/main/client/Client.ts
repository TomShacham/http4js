import * as http from 'http';
import {Response} from "../core/Response";
import {Request} from "../core/Request";
import {Body} from "../core/Body";

export function HttpClient(request: Request) {
    switch (request.method) {
        case "GET":
            return get(request);
        case "POST":
            return wire(request);
        case "PUT":
            return wire(request);
        case "PATCH":
            return wire(request);
        case "DELETE":
            return wire(request);
        case "HEAD":
            return wire(request);
        case "OPTIONS":
            return wire(request);
        case "TRACE":
            return wire(request);

        default:
            return get(request)

    }
}

function get(request: Request): Promise<Response> {
    const options = request.uri.asNativeNodeRequest;
    options['headers'] = request.headers;

    return new Promise(succ => {
        http.request(options, (res) => {
            const chunks = [];
            res.on('data', (chunk) => {
                chunks.push(chunk);
            });
            res.on('end', () => {
                const body = new Body(Buffer.concat(chunks));
                const response = new Response(res.statusCode, body).withHeaders(res.headers);
                return succ(response);
            });
        }).end();
    });
}

function wire(request: Request) {
    const options = request.uri.asNativeNodeRequest;
    options['headers'] = request.headers;
    options['method'] = request.method;

    return new Promise(succ => {
        const clientRequest = http.request(options, (res) => {
            const chunks = [];
            res.on('data', (chunk) => {
                chunks.push(chunk);
            });
            res.on('end', () => {
                const body = new Body(Buffer.concat(chunks));
                const response = new Response(res.statusCode, body).withHeaders(res.headers);
                return succ(response);
            });
        });
        clientRequest.write(request.bodyString());
        clientRequest.end();
    });
}