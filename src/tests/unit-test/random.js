import UnitTest from "./unit-test.js";
import { sleep } from "../../utils.js";

export default class RandomTest extends UnitTest {
    static dummy = UnitTest.derived.add({
        name: this.name,
        title: "Random",
        instance: new RandomTest(),
    });

    async run() {
        await sleep(100);
        return Math.random() < 0.5;
    }
}
