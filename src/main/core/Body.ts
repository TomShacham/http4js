export class Body {
    public bytes;

    constructor(bytes: Buffer | string) {
        this.bytes = bytes;

    }

    bodyString() {
        if (typeof this.bytes == "string") {
            return this.bytes;
        } else {
            return this.bytes.toString();
        }
    }

}
