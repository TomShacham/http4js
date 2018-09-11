import {Form} from "../../main/core/Form";
import {equal, deepEqual} from "assert";

describe('form', () => {

    it('gets form field', () => {
        equal(Form.of({name: 'tom'}).field('name'), 'tom');
    });

    it('adds a form field', () => {
        deepEqual(Form.of({name: 'tom'}).withFormField('age', '27').asObject(), {name: 'tom', age: '27'})
    });

    it('gives you form as object', () => {
        deepEqual(
            Form.of({name: 'tom'}).withFormField('age', '27').withFormField('age', '28').asObject(),
            {name: 'tom', age: ['27', '28']}
        )
    });

    it('accumulates fields of same name', () => {
        deepEqual(Form.of({name: 'tom'})
            .withFormField('age', '27')
            .withFormField('age', '28')
            .asObject(),
        {name: 'tom', age: ['27', '28']})
    });

    it('merges forms', () => {
        deepEqual(Form.of({name: 'tom'})
            .withForm({name: 'ben', age: '31'})
            .withForm({name: 'losh', age: '33'}).asObject(),
            {name: ['tom', 'ben', 'losh'], age: ['31', '33']}
        );
    });

    it('gives form body string', () => {
        equal(
            Form.of({name: 'tom'}).withFormField('age', '27').withFormField('age', '28').formBodyString(),
            'name=tom&age=27&age=28'
        )
    });

    it('create from a form body string', () => {
        deepEqual(
            Form.fromBodyString('name=tom&age=27&age=28'),
            Form.of({name: 'tom'}).withFormField('age', '27').withFormField('age', '28')
        )
    });

});