import {TestApp} from "../TestApp";
import {Request} from "http4js/dist/core/Request";

describe("listing friends", () => {

    it("shows them all unfiltered", async () => {
        let testApp = new TestApp();
        await testApp.serve(new Request("POST", "/friends").withForm({name: "Tosh"}));
        await testApp.serve(new Request("POST", "/friends").withForm({name: "Bosh"}));
        await testApp.serve(new Request("POST", "/friends").withForm({name: "Losh"}));
        await testApp.approve("unfiltered friends",
            new Request("GET", "/friends"))
    });

    it("shows one friend at a time", async () => {
        let testApp = new TestApp();
        await testApp.serve(new Request("POST", "/friends").withForm({name: "Tosh"}));
        await testApp.approve("one friend",
            new Request("GET", "/friends/Tosh"))
    });

});