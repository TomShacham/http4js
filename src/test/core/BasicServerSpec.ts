import {routes, ResourceRoutingHttpHandler} from "../../main/core/RoutingHttpHandler";
import {Response} from "../../main/core/Response";
import {Body} from "../../main/core/Body";
import {equal} from "assert";
import {Request} from "../../main/core/Request";
import {Method} from "../../main/core/HttpMessage";

describe('a basic in memory server', () => {

    it('takes request and gives response', function () {
        let requestBody = "Got it.";
        let handler = (req: Request) => { return new Response(req.body); };
        let resourceRoutingHttpHandler = routes("/test", handler);
        let response = resourceRoutingHttpHandler.match(new Request(Method.GET, "/test", new Body(requestBody)));

        equal(response.body.bodyString(), requestBody)
    });

});
