import {Readable} from "stream";
import {BodyType} from "./HttpMessage";

export class Body {
    private readStream: Readable | undefined;
    private bodystring: string | undefined;

    constructor(data: BodyType) {
        if (typeof data === 'string') {
            this.bodystring = data;
        } else {
            this.readStream = data;
        }
    }

    static of(data: BodyType): Body {
        return new Body(data);
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
