import {Stack} from "./src/main/Stack";
import {RealFriendsDB} from "./src/main/RealFriendsDB";
import {FriendsService} from "./src/main/FriendsService";

main();

function main() {
    let config = {port: 3000};
    let realFriendsDb = new RealFriendsDB();
    let friendsService = new FriendsService(realFriendsDb);

    new Stack(config, friendsService).start();
}
