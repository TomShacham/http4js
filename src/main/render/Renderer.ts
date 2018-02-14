import * as fs from "fs";

export class Renderer {
    render(path: string): string {
        console.log(fs.readdirSync("."));
        return fs.readFileSync(path, {encoding: 'utf8'});
    }
}