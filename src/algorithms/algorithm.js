class Algorithm {
	constructor() {
		if (new.target != Algorithm) return;
		throw new Error("Cannot instantiate abstract class Algorithm directly.");
	}

	getNextDecision() {}
}
