import { round } from "../utils.js";

export default class Decision {
	isValid = false;
	#game = null;
	#purchaseable = null;
	#wait = 0;

	constructor(game, purchaseable) {
		this.#game = game;
		this.#purchaseable = purchaseable;
		this.#wait = purchaseable.cost / game.cps;

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

		this.#game.realTime += this.#wait;
		this.#game.cookies += this.#purchaseable.cost;

		const oldCpS = this.#game.cps;
		this.#purchaseable.purchase(this.#game);
		const cpsIncrease = round(this.#game.cps - oldCpS, 1);

		console.log("Result:", "CpS", this.#game.cps, "increased by", cpsIncrease);
	}
}
