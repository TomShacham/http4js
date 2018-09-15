import * as https from "https";
import {HeadersJson, Req, Res, ResOf} from "../";
import {Readable} from "stream";
import {ReqOptions} from "./Client";
import {ReqOf} from "../core/Req";

export async function HttpsClient(request: Req | ReqOptions): Promise<Res> {
    const req = request instanceof Req
        ? request
        : ReqOf(request.method, request.uri, request.body, request.headers);

    const options = req.uri.asNativeNodeRequest;
    const reqOptions = {
        ...options,
        headers: req.headers,
        method: req.method,
    };

    // type system needs a hand
    const promise: Promise<Res> = new Promise(resolve => {
        https.request(reqOptions, (res) => {
            const inStream = new Readable({ read() {} });
            res.on('error', (err: any) => {
                console.error(err);
            }).on('data', (chunk: Buffer) => {
                inStream.push(chunk);
            }).on('end', () => {
                inStream.push(null); // No more data
                return resolve(ResOf(res.statusCode, inStream, res.headers as HeadersJson));
            });
        }).end();
    });

    return promise;
}