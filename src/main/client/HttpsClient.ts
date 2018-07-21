import * as https from "https";
import {HeadersType, Req, Res, ResOf} from "../";

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
            const chunks: Buffer[] = [];
            res.on('data', (chunk: Buffer) => {
                chunks.push(chunk);
            });
            res.on('end', () => {
                return resolve(ResOf(res.statusCode, Buffer.concat(chunks).toString(), res.headers as HeadersType));
            });
        }).end();
    });

    return promise;
}