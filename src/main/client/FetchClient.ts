import fetch from 'node-fetch';
import {Res} from "../core/Res";
import {Req} from "../core/Req";
import {RequestRedirect} from "node-fetch";

export function FetchClient(request: Req): Promise<Res> {
    switch (request.method) {
        case 'GET':
            return get(request);

        default:
            return wire(request)
    }
}

function get(request: Req): Promise<Res> {
    const options = {
        headers: request.headers,
        method: request.method,
        mode: 'cors',
        redirect: 'follow' as RequestRedirect,
        referrer: 'no-referrer',
    };
    return fetch(request.uri.toString(), options).then((res: any) => {
        return res.text().then((text: string) => {
            return new Res(res.status, text);
        })
    });
}

function wire(request: Req): Promise<Res> {
    const options = {
        body: request.body.toString(), // must match 'Content-Type' header
        headers: request.headers,
        method: request.method,
        redirect: 'follow' as RequestRedirect,
        referrer: 'no-referrer',
    };
    return fetch(request.uri.toString(), options).then((res: any) => {
        return res.text().then((text: string) => {
            return new Res(res.status, text);
        })
    });
}