export default class Purchasable {
	name = "";
	cost = 0;

	constructor(name, cost) {
		if (new.target == Purchasable)
			throw new Error(
				"Cannot instantiate abstract class Purchasable directly.",
			);

		this.name = name;
		this.cost = cost;
	}

	calcCost() {
		throw new Error(
			`Method '${this.calcCost.name}' must be implemented by subclass.`,
		);
	}

	onPurchase() {
		throw new Error(
			`Method '${this.onPurchase.name}' must be implemented by subclass.`,
		);
	}

	canPurchase() {
		throw new Error(
			`Method '${this.canPurchase.name}' must be implemented by subclass.`,
		);
	}

	purchase(game) {
		if (!this.canPurchase()) return;
		const canAfford = this.cost <= game.cookies;
		if (!canAfford) return false;

		this.onPurchase();
		game.cookies -= this.cost;
		this.cost = this.calcCost();
		return true;
	}
}
