import {Stream} from "stream";
import {Readable} from "stream";

export class Body {
    private readStream: Readable | undefined;
    private bodystring: string | undefined;

    constructor(data: Readable | string) {
        if (typeof data === 'string') {
            this.bodystring = data;
        } else {
            this.readStream = data;
        }
    }

    bodyString() {
        if (this.bodystring !== undefined) {
            return this.bodystring;
        }
        const buffer: Buffer | undefined = this.readStream!.read();
        const string = buffer ? buffer.toString('utf8') : '';
        this.bodystring = string;
        return string;
    }

    bodyStream() {
        return this.readStream;
    }

}

export function BodyOf(data: Readable | string): Body {
    return new Body(data);
}