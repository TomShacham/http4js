import {App} from "./App";
import {NativeServer} from "http4js/dist/servers/NativeServer";
import {FriendsService} from "./FriendsService";

export class Stack {
    private config;
    private friendsService;
    private server;
    public app;

    constructor(config = {port: 3000}, friendsService: FriendsService) {
        this.config = config;
        this.friendsService = friendsService;
        this.port = this.config.port;
        this.app = new App(this.friendsService);
        this.server = this.app
            .routes()
            .asServer(new NativeServer(this.port));
    }

    async start() {
        console.log("Started app on " + this.port);
        this.server.start()
    }

    async stop() {
        this.server.stop();
        console.log("Stopped app on " + this.port);
    }
}


