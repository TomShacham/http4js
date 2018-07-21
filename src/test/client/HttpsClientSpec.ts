import {equal} from 'assert';
import {isNullOrUndefined} from "util";
import {ReqOf} from "../../main";
import {HttpsClient} from "../../main/client/HttpsClient";

describe('https client', () => {

    it('make an https get request', async () => {
        const response = await HttpsClient(ReqOf('GET', 'https://httpbin.org/get'));
        equal(response.status, 200);
        isNullOrUndefined(!response.body);
        isNullOrUndefined(!response.headers);
    });

    it('makes an https post request', async () => {
        const response = await HttpsClient(ReqOf('POST', 'https://httpbin.org/post'));
        equal(response.status, 200);
        isNullOrUndefined(!response.body);
        isNullOrUndefined(!response.headers);
    });

    it('makes an https put request', async () => {
        const response = await HttpsClient(ReqOf('PUT', 'https://httpbin.org/put'));
        equal(response.status, 200);
        isNullOrUndefined(!response.body);
        isNullOrUndefined(!response.headers);
    });

});