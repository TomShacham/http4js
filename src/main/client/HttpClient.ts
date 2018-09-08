import * as http from "http";
import {Res} from "../core/Res";
import {Req} from "../core/Req";
import {BodyOf} from "../core/Body";
import {Headers, HeaderValues} from "../core/Headers";
import {IncomingMessage} from "http";
import {ResOf} from "../core/Res";
import {HeadersType} from "../core/HttpMessage";

export function HttpClient(request: Req): Promise<Res> {
    switch (request.method) {
        case "GET":
            return get(request);

        default:
            return wire(request)

    }
}

function get(request: Req): Promise<Res> {
    const requestOptions = {
        ...request.uri.asNativeNodeRequest,
        headers: request.headers
    };

    return new Promise(resolve => {
        http.request(requestOptions, (res: IncomingMessage) => {
            return resolve(ResOf(res.statusCode, res, res.headers as HeadersType));
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
        const clientRequest = http.request(requestOptions, (res: IncomingMessage) => {
            return resolve(ResOf(res.statusCode, res, res.headers as HeadersType));
        });
        if (req.bodyStream()){
            req.bodyStream()!.pipe(clientRequest);
        } else {
            clientRequest.write(req.bodyString());
            clientRequest.end();
        }
    });
}