import {FormType, FormField} from "./HttpMessage";

export class Form {
    private form: FormType;

    constructor(form: FormType) {
        this.form = form;
    }

    static of(form: FormType) {
        return new Form(form);
    }

    static fromBodyString(formBody: string): Form {
        const form: Form = Form.of({});
        if (formBody === '') return form;
        return formBody.split("&").reduce((form: Form, formPart: string) => {
            const parts = formPart.split('=');
            return form.withFormField(parts[0], parts[1]);
        }, form);
    }


    field(name: string): FormField | undefined {
        return this.form[name];
    }

    withFormField(name: string, value: FormField): Form {
        const form = {...this.form};
        if (form[name]) {
            if (typeof form[name] === 'string') {
                (typeof value === 'string')
                    ? form[name] = [form[name] as string, value as string]
                    : form[name] = [form[name] as string, ...value as string[]]
            } else {
                (typeof value === 'string')
                    ? form[name] = [...form[name] as string[], value as string]
                    : form[name] = [...form[name] as string[], ...value as string[]]
            }
        } else {
            form[name] = value;
        }
        return Form.of(form)
    }

    withForm(newForm: FormType): Form {
        const existingForm = Form.of({...this.form});
        return Object.keys(newForm).reduce((form: Form, fieldName: string) => {
            return form.withFormField(fieldName, newForm[fieldName]);
        }, existingForm);
    }

    asObject(): FormType {
        return this.form;
    }

    formBodyString(): string {
        const form = {...this.form};
        let formParts: string[] = Object.keys(this.form).reduce((bodyParts: string[], fieldName: string) => {
            typeof (form[fieldName]) === "object"
                ? (form[fieldName] as string[]).map(value => bodyParts.push(`${fieldName}=${value}`))
                : bodyParts.push(`${fieldName}=${form[fieldName]}`);
            return bodyParts;
        }, []);
        return formParts.join("&");
    }


}