export default class UnitTest {
    static derived = new Set();

    run() {
        throw new Error(
            `Method '${this.run.name}' must be implemented by subclass.`,
        );
    }
}
