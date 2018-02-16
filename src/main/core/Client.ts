import * as http from 'http';
import {Response} from "./Response";
import {Body} from "./Body";

export function HttpClient(request) {
    if (request.method == "GET") {
        return get(request)
    } else {
        return post(request)
    }
}


function get(request): Promise<Response> {
    let options = request.uri.asRequest;
    options.headers = request.headers;

    return new Promise(succ => {
        http.request(options, (res) => {
            let chunks = [];
            res.on('data', (chunk) => {
                chunks.push(chunk);
            });
            res.on('end', () => {
                let body = new Body(Buffer.concat(chunks));
                let response = new Response(res.statusCode, body).setHeaders(res.headers);
                return succ(response);
            });
        }).end();
    });
};

function post(request): Promise<Response> {
    let options = request.uri.asRequest;
    options.headers = request.headers;
    options.method = request.method;

    return new Promise(succ => {
        let clientRequest = http.request(options, (res) => {
            let chunks = [];
            res.on('data', (chunk) => {
                chunks.push(chunk);
            });
            res.on('end', () => {
                let body = new Body(Buffer.concat(chunks));
                let response = new Response(res.statusCode, body).setHeaders(res.headers);
                return succ(response);
            });
        });
        clientRequest.write(request.body.bodyString());
        clientRequest.end();
    });
}

