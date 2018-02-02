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
                    let response = new Response(body).setHeaders(res.headers);
                    succ(response);
                });
            }).end();
        });
    };

    this.post = (request) => {
        let options = {};
        options["hostname"] = "localhost";
        options["port"] = 3000;
        options["path"] = "/";
        options["headers"] = request.headers;
        options["method"] = "POST";

        return new Promise(succ => {
            let clientRequest = http.request(options, (res) => {
                let chunks = [];
                res.on('data', (chunk) => {
                    chunks.push(chunk);
                });
                res.on('end', () => {
                    let body = new Body(Buffer.concat(chunks));
                    let response = new Response(body).setHeaders(res.headers);
                    succ(response);
                });
            });
            clientRequest.write(request.body.bodyString());
            clientRequest.end();
        });
    }
}

