import {Stack} from "../../main/Stack";
import {FriendsService} from "../../main/FriendsService";
import {RealFriendsDB} from "../../main/RealFriendsDB";
import {Req} from "http4js/core/Request";
import {ApiExamples} from "../ApiExamples";
import {equal} from "assert";

const realApp = new Stack({port: 3001}, new FriendsService(new RealFriendsDB()));
const apiExamples = new ApiExamples("friendsService");

before(async() => {
    realApp.start();
});

after(async() => {
    realApp.stop()
});

describe("friends", () => {

    it("saves a friend", async() => {
        const request = Req("POST", "/friends").withFormField("name", "Tosh");
        const response = await realApp.app.routes().serve(request);
        equal(response.status, 302);
        await apiExamples.save("save-friend", request, response);
    });

});