import * as express from "express";
import {routes} from "../../main/core/RoutingHttpHandler";
import {response} from "../../main/core/Response";
import {ExpressServer} from "../../main/core/Server";
import {HttpClient} from "../../main/core/Client";
import {request} from "../../main/core/Request";
import {equal} from "assert";

let expressApp = express();

expressApp.use((req, res, next) => {
    res.setHeader("foo", "bar");
    res.writeHead(202);
    next();
});

const http4jsExpressServer = routes("GET", "/", (req) => {
    return new Promise(resolve => resolve(response()));
}).asServer(new ExpressServer(expressApp, 3001));

before(() => {
    http4jsExpressServer.start();
});

after(() => {
    http4jsExpressServer.stop();
});


describe("express backend", () => {

    it("respects middleware", () => {
        return HttpClient(request("GET", "http://localhost:3001/")).then(response => {
            equal(response.headers["foo"], "bar");
            equal(response.status, 202);
        })
    });

});