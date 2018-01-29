export class Body {
    public bytes;
    public asString;

    constructor (bytes: Buffer | string) {
        if (typeof bytes == "string") {
            this.asString = bytes;
        } else {
            this.bytes = bytes;
        }
    }

    toString() {
        return this.bytes.toString()
    }
}
