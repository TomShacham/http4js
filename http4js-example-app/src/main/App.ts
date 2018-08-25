import * as Handlebars from "handlebars";
import * as fs from "fs";
import {FriendsService} from "./FriendsService";
import {Friend} from "./Friend";
import {Routing, get} from "http4js/core/Routing";
import {Res, Redirect} from "http4js/core/Response";

const render = (templateName, data) => {
    const source = fs.readFileSync(`./src/templates/${templateName}.hbs`).toString("utf8");
    const template = Handlebars.compile(source);
    return template(data);
};

export class App {

    friends: FriendsService;

    constructor(friends: FriendsService) {
        this.friends = friends;
        return this;
    }

    routes(): Routing {
        return get("/", () => Res(200, "Hello, world!"))

            .withGet("/friends", async(req) => {
                const searchTerm = req.queries.name;
                const friends = await this.friends.all();
                const filteredFriends = searchTerm
                    ? friends.filter(friend => friend.name.indexOf(searchTerm) > -1)
                    : friends;

                const html = render("friends", {friends: filteredFriends});

                return Res(200, html);
            })

            .withGet("/friends/{name}", async(req) => {
                const name = req.pathParams.name;
                const friends = await this.friends.all();
                const filteredFriends = name
                    ? friends.filter(friend => friend.name.indexOf(name) > -1)
                    : friends;
                let html = (filteredFriends.map(friend => friend.name)).join(",");
                return Res(200, html);
            })

            .withPost("/friends", async(req) => {
                const name = req.form.name;
                const newFriend = new Friend(name);
                const saved = await this.friends.add(newFriend);
                return Redirect(302, "/friends");
            })

            .withFilter((handler) => async (req) => {
                const response = await handler(req);
                if (response.status == 404) {
                    return Res(404, "Page not found");
                } else {
                    return response;
                }
            })
            //this is for google chrome
            .withGet("/favicon.ico", () => Res(200))

    }
}

