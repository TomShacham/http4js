import {HttpClient} from "./src/main/core/Client";
import {request} from "./src/main/core/Request";
export * from "./dist/main/core/RoutingHttpHandler";
export * from "./dist/main/core/Request";
export * from "./dist/main/core/Response";
export * from "./dist/main/core/Server";
export * from "./dist/main/core/Client";
export * from "./dist/main/core/Body";
export * from "./dist/main/core/Uri";

const express = require('express');
const bodyParser = require('body-parser');

let expressApp = express();
expressApp.use(bodyParser.urlencoded({extended: true}));
expressApp.use(bodyParser.json());

expressApp.post("/express-post", (req, res) => {
    console.log("REQ BODY EXPRESS");
    console.log(req.body);
    res.end("OK");
});

expressApp.listen(3000);

HttpClient(request("POST", "http://localhost:3000/express-post", '{"a": "b"}', {"Content-Type": "application/json"})).then(
    response => console.log(response.bodyString())
);