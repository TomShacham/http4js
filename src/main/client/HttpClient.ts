import * as http from "http";
import {Res} from "../core/Res";
import {Req} from "../core/Req";
import {HeadersType, ResOf} from "../";

export function HttpClient(request: Req): Promise<Res> {
    switch (request.method) {
        case "GET":
            return get(request);

        default:
            return wire(request)

    }
}

function get(request: Req): Promise<Res> {
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
                return resolve(ResOf(res.statusCode, Buffer.concat(chunks).toString(), res.headers as HeadersType));
            });
        }).end();
    });
}

function wire(req: Req): Promise<Res> {
    const options = req.uri.asNativeNodeRequest;
    const requestOptions = {
        ...options,
        headers: req.headers,
        method: req.method,
    };

    return new Promise(resolve => {
        const clientRequest = http.request(requestOptions, (res) => {
            const chunks: Buffer[] = [];
            res.on('data', (chunk: Buffer) => {
                chunks.push(chunk);
            });
            res.on('end', () => {
                return resolve(new Res(res.statusCode, Buffer.concat(chunks).toString(), res.headers as HeadersType));
            });
        });
        console.log('client');
        const chunk2 = req.bodyString();
        console.log(chunk2);
        clientRequest.write(chunk2);
        clientRequest.end();
    });
}