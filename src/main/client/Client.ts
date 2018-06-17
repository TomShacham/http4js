import * as http from 'http';
import {Response} from "../core/Response";
import {Request} from "../core/Request";

export function HttpClient(request: Request): Promise<Response> {
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
    const requestOptions = {
        ...options,
        headers: request.headers
    };

    return new Promise(resolve => {
        http.request(requestOptions, (res) => {
            const chunks: Buffer[] = [];
            res.on('data', (chunk: Buffer) => {
                chunks.push(chunk);
            });
            res.on('end', () => {
                return resolve(new Response(res.statusCode, Buffer.concat(chunks).toString(), res.headers));
            });
        }).end();
    });
}

function wire(request: Request): Promise<Response> {
    const options = request.uri.asNativeNodeRequest;
    const requestOptions = {
        ...options,
        headers: request.headers,
        method: request.method,
    };

    return new Promise(resolve => {
        const clientRequest = http.request(requestOptions, (res) => {
            const chunks: Buffer[] = [];
            res.on('data', (chunk: Buffer) => {
                chunks.push(chunk);
            });
            res.on('end', () => {
                return resolve(new Response(res.statusCode, Buffer.concat(chunks).toString(), res.headers));
            });
        });
        clientRequest.write(request.bodyString());
        clientRequest.end();
    });
}