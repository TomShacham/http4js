import * as http from "http";
import {IncomingMessage} from "http";
import {Res, ResOf} from "../core/Res";
import {Req, ReqOf} from "../core/Req";
import {Headers, HeaderValues} from "../core/Headers";
import {HeadersJson} from "../core/HttpMessage";
import {ReqOptions} from "./Client";

export function HttpClient(request: Req | ReqOptions): Promise<Res> {
    const req = request instanceof Req
        ? request
        : ReqOf(request.method, request.uri, request.body, request.headers);
    switch (req.method) {
        case "GET":
            return get(req);

        default:
            return wire(req)

    }
}

function get(request: Req): Promise<Res> {
    const requestOptions = {
        ...request.uri.asNativeNodeRequest,
        headers: request.headers
    };

    return new Promise(resolve => {
        http.request(requestOptions, (res: IncomingMessage) => {
            return resolve(ResOf(res.statusCode, res, res.headers as HeadersJson));
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
            return resolve(ResOf(res.statusCode, res, res.headers as HeadersJson));
        });
        if (req.bodyStream()){
            req.bodyStream()!.pipe(clientRequest);
        } else {
            clientRequest.write(req.bodyString());
            clientRequest.end();
        }
    });
}