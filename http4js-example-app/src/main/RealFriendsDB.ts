import {Friend} from "./Friend";
import {FriendsDB} from "./FriendDb";

const {Pool} = require('pg');

export class RealFriendsDB implements FriendsDB {
    private pool;
    constructor() {
        this.pool = new Pool({
            user: 'postgres', //env var: PGUSER
            database: 'postgres', //env var: PGDATABASE
            password: 'postgres', //env var: PGPASSWORD
            host: 'localhost', // Server hosting the postgres database
            port: 5432, //env var: PGPORT
            max: 100, // max number of clients in the pool
            idleTimeoutMillis: 15000 // how long a client is allowed to remain idle before being closed
        });
        RealFriendsDB.runMigrations();
    }

    async all(): Promise<Friend[]> {
        const friends = await this.pool.query("select * from friends");
        return friends.rows;
    }

    async add(friend: Friend): Promise<Friend> {
        const saved = await this.pool.query("insert into friends values(default, $1)", [friend.name]);
        return saved.rows;
    }

    async deleteAll() {
        return await this.pool.query("delete from friends");
    }

    private static runMigrations() {
        const migrations = [
            "CREATE TABLE IF NOT EXISTS FRIENDS(id serial primary key, name varchar(64) not null)",
        ];
    }
}
