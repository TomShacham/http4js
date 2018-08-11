import {IdGenerator} from "../../../http4js-zipkin/src/Zipkin";

export class DeterministicIdGenerator implements IdGenerator {
    private counter: number = 0;

    newId(): string {
        const counter = this.counter;
        this.counter += 1;
        return counter.toString();
    }
}
