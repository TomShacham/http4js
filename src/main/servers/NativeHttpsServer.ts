import {Certs, NativeServer} from "./NativeServer";

export class NativeHttpsServer extends NativeServer {
    constructor(port: number, certs: Certs) {
        super(port, certs);
    }
}