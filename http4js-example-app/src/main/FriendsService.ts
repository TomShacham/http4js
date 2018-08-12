import {FriendsDB} from "./FriendDb";
import {Friend} from "./Friend";

export class FriendsService {
    private db;

    constructor(friendsDb: FriendsDB) {
        this.db = friendsDb;
    }

    async all(): Promise<Friend[]> {
        const results = await this.db.all();

        return this.toFriends(results);
    }

    async add(friend: Friend): Promise<Friend> {
        return await this.db.add(friend)
    }

    async deleteAll() {
        return await this.db.deleteAll();
    }

    private toFriends(rows) {
        return rows.map(it => new Friend(it.name))
    }
}