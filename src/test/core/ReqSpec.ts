import * as assert from 'assert';
import {deepEqual, equal, notEqual} from 'assert';
import {Headers, HeaderValues} from '../../main/core/Headers';
import {ReqOf} from '../../main';
import {Readable} from "stream";
import {BodyOf} from "../../main/core/Body";

describe('in mem request', () => {

    it('is immutable', () => {
       const request1 = ReqOf('GET', '/');
       const request2 = request1.withHeader('tom', 'tosh');

        notEqual(request1, request2);
    });

    it('set method is case insensitive', () => {
        equal(
            ReqOf('gEt', '/')
                .method,
            'GET')
    });

    it('set uri', () => {
        equal(
            ReqOf('GET', '/')
                .withUri('/tom')
                .uri
                .path(),
            '/tom')
    });

    it('set plain body', () => {
        equal(
            ReqOf('GET', '/')
                .withBody('body boy')
                .bodyString(),
            'body boy')
    });

    it('sets form field body on post', () => {
        deepEqual(
            ReqOf('POST', '/')
                .withFormField('name', 'tosh')
                .bodyForm(),
            {name: 'tosh'}
        )
    });

    it('sets many form fields body on post', () => {
        const formRequest = ReqOf('POST', '/')
            .withFormField('name', 'tosh')
            .withFormField('age', '27');
        equal(formRequest.bodyString(), 'name=tosh&age=27');
    });

    it('multiple same form fields lists all values', () => {
        const formRequest = ReqOf('POST', '/')
            .withFormField('name', 'tosh')
            .withFormField('name', 'bosh')
            .withFormField('name', 'losh');
        equal(formRequest.bodyString(), 'name=tosh&name=bosh&name=losh');
    });

    it('gives form field as list of strings', () => {
        const formRequest = ReqOf('POST', '/')
            .withFormField('name', ['tosh', 'bosh']);
        equal(formRequest.bodyString(), 'name=tosh&name=bosh');
    });

    it('sets all form on post', () => {
        deepEqual(
            ReqOf('POST', '/')
                .withForm({name: ['tosh', 'bosh'], age: '27'})
                .withHeader(Headers.CONTENT_TYPE, HeaderValues.FORM)
                .bodyForm(),
            { name: [ 'tosh', 'bosh' ], age: '27' }
        )
    });

    it('sets form encoded header', () => {
        equal(
            ReqOf('POST', '/')
                .withForm({name: ['tosh', 'bosh'], age: '27'})
                .withFormField('name', 'tosh')
                .header(Headers.CONTENT_TYPE),
            HeaderValues.FORM
        )
    });

    it('doesnt set form encoded header if content type header already set', () => {
        equal(
            ReqOf('POST', '/')
                .withHeader(Headers.CONTENT_TYPE, HeaderValues.MULTIPART_FORMDATA)
                .withForm({name: ['tosh', 'bosh'], age: '27'})
                .header(Headers.CONTENT_TYPE),
            HeaderValues.MULTIPART_FORMDATA
        )
    });

    it('set body string', () => {
        equal(
            ReqOf('GET', '/')
                .withBody('tommy boy')
                .bodyString(),
            'tommy boy')
    });

    it('body is handle on stream if given a stream', () => {
        const readable = new Readable({read(){}});
        readable.push('some body');
        readable.push(null);
        equal(
            ReqOf('GET', '/')
                .withBody(readable)
                .bodyStream(),
            readable
        )
    });

    it('bodystring works as expected even if req body is a stream', () => {
        const readable = new Readable({read(){}});
        readable.push('some body');
        readable.push(null);
        const reqWithStreamBody = ReqOf('GET', '/').withBody(readable);
        equal(reqWithStreamBody.bodyString(), 'some body');
        equal(reqWithStreamBody.bodyString(), 'some body'); // read multiple times
    });

    it('sets query string', () => {
        equal(
            ReqOf('GET', '/tom')
                .withQuery('tom', 'tosh')
                .withQuery('ben', 'bosh')
                .uri
                .queryString(),
            'tom=tosh&ben=bosh')
    });

    it('decodes query string parameters', () => {
        deepEqual(
            ReqOf('GET', '/tom')
                .withQuery('tom', 'tosh%20eroo')
                .withQuery('ben', 'bosh%2Aeroo')
                .queries,
            {tom: 'tosh eroo', ben: 'bosh*eroo'})
    });

    it('sets query string using object of key-values', () => {
        equal(
            ReqOf('GET', '/tom')
                .withQueries({tom: 'tosh', ben: 'bosh'})
                .uri
                .queryString(),
            'tom=tosh&ben=bosh')
    });

    it('get header is case insensitive', () => {
        equal(
            ReqOf('GET', 'some/url')
                .withHeader('TOM', 'rocks')
                .header('tom'),
            'rocks');
    });

    it('set header on request', () => {
        equal(
            ReqOf('GET', 'some/url')
                .withHeader('tom', 'smells')
                .header('tom'),
            'smells');
    });

    it('concat same header on request', () => {
        assert.deepEqual(
            ReqOf('GET', 'some/url')
                .withHeader('tom', 'smells')
                .withHeader('tom', 'smells more')
                .withHeader('tom', 'smells some more')
                .header('tom'),
            'smells, smells more, smells some more');
    });

    it('replace header', () => {
        equal(
            ReqOf('GET', 'some/url')
                .withHeader('tom', 'smells')
                .replaceHeader('tom', 'is nice')
                .header('tom'),
            'is nice');
    });

    it('remove header', () => {
        equal(
            ReqOf('GET', 'some/url')
                .withHeader('tom', 'smells')
                .removeHeader('tom')
                .header('tom'),
            undefined);
    });

    it('gives value malformed uri component if query is malformed', () => {
        equal(
            ReqOf('GET', 'some/url?tosh=a%20b%20c%20%20^%20*%20%%20$%20%C2%A3')
                .query('tosh'),
            'Malformed URI component');
    })

});