import {Headers} from "../../main/core/Headers";
import {equal} from "assert";
import {deepEqual} from "assert";

describe('headers', () => {

    it('gets a header', () => {
        const headers = Headers.of({name: 'tom'});
        equal(headers.header('name'), 'tom');
    });

    it('undefined if not there', () => {
        const headers = Headers.of({});
        equal(headers.header('name'), undefined);
    });

    it('adds a header', () => {
        const headers = Headers.of({name: 'tom'})
            .withHeader('age', '27');
        deepEqual(headers.asObject(), { name: 'tom', age: '27' });
    });

    it('adds many headers', () => {
        const headers = Headers.of({name: 'tom'})
            .withHeaders({'age': '27', kiting: 'true'});
        deepEqual(headers.asObject(), { name: 'tom', age: '27', kiting: 'true' });
    });

    it('replaces a header', () => {
        const headers = Headers.of({name: 'tom'})
            .replaceHeader('name', 'ben');
        deepEqual(headers.asObject(), { name: 'ben' });
    });

    it('replaces all headers', () => {
        const headers = Headers.of({name: 'tom', age: '27'})
            .replaceAllHeaders({'name': 'ben'});
        deepEqual(headers.asObject(), { name: 'ben' });
    });

    it('removes a header', () => {
        const headers = Headers.of({name: 'tom'})
            .removeHeader('name');
        deepEqual(headers.asObject(), {});
    });

    it('accumulates headers of the same name', () => {
        const headers = Headers.of({name: 'tom'})
            .withHeaders({name: '27', kiting: 'true'});
        deepEqual(headers.asObject(), { name: 'tom, 27', kiting: 'true' });
    });

});