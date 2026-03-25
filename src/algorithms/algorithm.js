export default class Algorithm {
	static derived = new Set();
	#isRunning = false;
	#runPromise = null;

	constructor() {
		if (new.target != Algorithm) return;
		throw new Error("Cannot instantiate abstract class Algorithm directly.");
	}

	getNextDecision() {
		throw new Error(
			`Method '${this.getNextDecision.name}' must be implemented by subclass.`,
		);
	}

	async run() {
		if (this.#isRunning) return this.#runPromise;
		this.#isRunning = true;

		this.#runPromise = (async () => {
			while (true) {
				const decision = this.getNextDecision();
				if (!decision.isValid) break;
				decision.perform();
				await new Promise((r) => setTimeout(r, 0));
			}
			this.#isRunning = false;
			this.#runPromise = null;
		})();

		return this.#runPromise;
	}
}
