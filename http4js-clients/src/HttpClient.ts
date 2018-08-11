import * as http from "http";
import {Res} from "../../http4js-core/src/core/Res";
import {Req} from "../../http4js-core/src/core/Req";
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

function wire(request: Req): Promise<Res> {
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
                return resolve(new Res(res.statusCode, Buffer.concat(chunks).toString(), res.headers as HeadersType));
            });
        });
        clientRequest.write(request.bodyString());
        clientRequest.end();
    });
}