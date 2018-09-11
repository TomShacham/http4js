import * as https from "https";
import {HeadersType, Req, Res, ResOf} from "../";
import {Readable} from "stream";

export async function HttpsClient(req: Req): Promise<Res> {
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
                return resolve(ResOf(res.statusCode, inStream, res.headers as HeadersType));
            });
        }).end();
    });

    return promise;
}