import {FriendsService} from "../../main/FriendsService";
import {RealFriendsDB} from "../../main/RealFriendsDB";
import {deepEqual} from "assert";
import {Friend} from "../../main/Friend";

describe("friends service", () => {
    let friendsService = new FriendsService(new RealFriendsDB());

    beforeEach(async() => {
        await friendsService.deleteAll();
    });

    it("adds a friend", async() => {
        await friendsService.add(new Friend("Tosh"));
        let allFriends = await friendsService.all();

        deepEqual(allFriends, [new Friend("Tosh")])
    });

    it("fetches all friends", async() => {
        await friendsService.add(new Friend("Tosh"));
        let allFriends = await friendsService.all();

        deepEqual(allFriends, [new Friend("Tosh")])
    });

});