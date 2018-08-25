import {Friend} from "./Friend";

export interface FriendsDB {
    all(): Promise<Array<Friend>>
    add(friend: Friend): Promise<Friend>
    deleteAll(): void
}
