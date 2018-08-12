import {App} from "./src/app";
import {NativeServer} from "http4js/dist/servers/NativeServer";

const PORT = parseInt(process.env["PORT"]);

const main = () => {
    new App().routes().asServer(new NativeServer(PORT)).start()
};

main();