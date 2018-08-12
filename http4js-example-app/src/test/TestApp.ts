import * as fs from "fs";
import {App} from "../main/App";
import {equal} from "assert";
import {FakeFriendsDB} from "../main/FakeFriendsDB";
import {FriendsService} from "../main/FriendsService";
import {RoutingHttpHandler} from "http4js/dist/core/Routing";
import {Request} from "http4js/dist/core/Request";
import {Response} from "http4js/dist/core/Response";

export class TestApp {
    routes: RoutingHttpHandler ;

    constructor(){
        const fakeFriendsDB = new FakeFriendsDB();
        const fakeFriendsService = new FriendsService(fakeFriendsDB);
        this.routes = new App(fakeFriendsService).routes();
    }

    async serve(req: Request): Promise<Response> {
        return this.routes.serve(req);
    }

    async approve(testFileName: string, req: Request) {
        const actual1 = await this.routes.serve(req);
        const actual = actual1.bodyString();
        const actualfilePath = `./src/test/resources/${testFileName}.actual`;
        fs.writeFileSync(actualfilePath, actual, "utf8");
        const approvalfilePath = `./src/test/resources/${testFileName}.approved`;
        try {
            const expected = fs.readFileSync(approvalfilePath, "utf8");
            equal(actual, expected);
        } catch (e) {
            if (e.message.includes("no such file or directory")) {
                console.log("*** Create file from actual ***");
                console.log(`cp "${actualfilePath}" "${approvalfilePath}"`);
            } else {
                console.log("*** To approve  ***");
                console.log(`cp "${actualfilePath}" "${approvalfilePath}"`);
            }
            throw e;
        }
    }

}
