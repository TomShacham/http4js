import * as http from 'http';
import {Response} from "./Response";
import {Body} from "./Body";

export function httpClient() {
    return new HttpClient();
}

export function HttpClient() {

    this.get = (options) => {
        return new Promise(succ => {
            http.request(options, (res) => {
                let chunks = [];
                res.on('data', (chunk) => {
                    chunks.push(chunk);
                });
                res.on('end', () => {
                    let body = new Body(Buffer.concat(chunks));
                    succ(new Response(body));
                });
            }).end();
        });
    };
}

