import Test from "./test.js";
import { sleep } from "../../utils.js";

export default class RandomTest extends Test {
    static dummy = Test.derived.add({
        name: this.name,
        title: "Random",
        instance: new RandomTest(),
    });

    async run() {
        await sleep(1000);
        return Math.random() < 0.5;
    }
}
