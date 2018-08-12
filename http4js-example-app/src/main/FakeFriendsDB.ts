import {FriendsDB} from "./FriendDb";
import {Friend} from "./Friend";

export class FakeFriendsDB implements FriendsDB {
    friends: Friend[] = [];

    constructor() {
        return this;
    }

    all(): Promise<Friend[]> {
        return Promise.resolve(this.friends);
    }

    add(friend: Friend): Promise<Friend> {
        this.friends.push(friend);
        return Promise.resolve(friend);
    }

    deleteAll(): void {
        this.friends = [];
    }

}
