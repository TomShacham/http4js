import * as http from "http";
import {Res} from "../core/Res";
import {Req} from "../core/Req";
import {HeadersType, ResOf} from "../";
import {Readable} from "stream";
import {BodyOf} from "../core/Body";
import {Headers, HeaderValues} from "../core/Headers";

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
            const inStream = new Readable({ read() {} });
            res.on('data', (chunk: Buffer) => {
                inStream.push(chunk);
            });
            res.on('end', () => {
                inStream.push(null); // No more data
                return resolve(new Res(res.statusCode, BodyOf(inStream), res.headers as HeadersType));
            });
        }).end();
    });
}

function wire(req: Req): Promise<Res> {
    const options = req.uri.asNativeNodeRequest;
    const headers = req.bodyStream()
        ? {...req.headers, [Headers.TRANSFER_ENCODING]: HeaderValues.CHUNKED}
        : req.headers;
    const requestOptions = {
        ...options,
        headers,
        method: req.method,
    };

    return new Promise(resolve => {
        const clientRequest = http.request(requestOptions, (res) => {
            const inStream = new Readable({ read() {} });
            res.on('data', (chunk: Buffer) => {
                inStream.push(chunk);
            });
            res.on('end', () => {
                inStream.push(null); // No more data
                return resolve(new Res(res.statusCode, BodyOf(inStream), res.headers as HeadersType));
            });
        });
        if (req.bodyStream()){
            req.bodyStream().pipe(clientRequest);
        } else {
            clientRequest.write(req.bodyString());
            clientRequest.end();
        }
    });
}