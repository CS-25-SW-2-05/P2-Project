import { round } from "../utils.js";

export default class Decision {
	isValid = false;
	#gameState = null;
	#purchaseable = null;
	#wait = 0;

	constructor(gameState, purchaseable) {
		this.#gameState = gameState;
		this.#purchaseable = purchaseable;
		this.#wait = purchaseable.cost / gameState.cps;

		this.isValid =
			this.#purchaseable != null &&
			this.#purchaseable.canPurchase() &&
			this.#wait > 0;
	}

	perform() {
		console.log(
			"Decision:",
			"purchase",
			this.#purchaseable.name,
			"after",
			Math.round(this.#wait),
			"seconds",
		);

		this.#gameState.realTime += this.#wait;
		this.#gameState.cookies += this.#purchaseable.cost;

		const oldCpS = this.#gameState.cps;
		this.#purchaseable.purchase(this.#gameState);
		const cpsIncrease = round(this.#gameState.cps - oldCpS, 1);

		console.log("Result:", "CpS", this.#gameState.cps, "increased by", cpsIncrease);
	}
}
