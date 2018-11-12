import {Readable} from "stream";
import {BodyContent} from "./HttpMessage";

export class Body {
    private readStream: Readable | undefined;
    private bodystring: string | undefined;

    constructor(data: BodyContent) {
        if (typeof data === 'string') {
            this.bodystring = data;
        } else {
            this.readStream = data;
        }
    }

    static of(data: BodyContent): Body {
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

    async bigBodyString() {
        if (this.bodystring !== undefined) {
            return this.bodystring;
        }
        const bytes = await this.readBytes(this.readStream!, 99999999);
        const string = bytes ? bytes.toString('utf-8') : '';
        this.bodystring = string;
        return string;
    }

    private async readable(rs: Readable): Promise<{}> {
        return new Promise(r => rs.on('readable', r));
    }

    private async readBytes(readable: Readable, numberOfBytes: number = 0): Promise<Buffer> {
        let buf = readable.read(numberOfBytes);
        if (buf) {
            return new Promise<Buffer>(r => r(buf));
        }
        else {
            return new Promise<Buffer>(r => {
                this.readable(readable).then(() => {
                    this.readBytes(readable, numberOfBytes).then(b => r(b));
                });
            });
        }
    }

}
