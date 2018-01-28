import * as http from 'http';
import {InMemoryResponse} from "./InMemoryResponse";

export function httpClient() {
    return new HttpClient();
}

export function HttpClient() {

    this.get = (options) => {
        return new Promise(succ => {
            http.request(options, (res) => {
                res.setEncoding('utf8');
                let chunks = [];
                res.on('data', (chunk) => {
                    chunks.push(chunk);
                });
                res.on('end', () => {
                    succ(new InMemoryResponse(res.statusCode, chunks));
                });
            }).end();
        });
    };
}

