import UnitTest from "./unit-test.js";
import { sleep } from "../../utils.js";
import BruteForceSegmented from "../../algorithms/brute-force-segmented.js";

export default class getMemoryStatusTest extends UnitTest {
    static dummy = UnitTest.derived.add({
        name: this.name,
        title: "getMemoryStatus",
        instance: new getMemoryStatusTest(),
    });

    async run() {
        const memoryTest = new BruteForceSegmented();
        const memoryLimit = 1;

        // calling the function should only result in an error
        try {
            memoryTest.getMemoryStatus(memoryLimit);
            return false;
        } catch {}

        return true;
    }
}
