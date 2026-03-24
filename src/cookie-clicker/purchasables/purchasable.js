class Purchasable {
	constructor() {
		if (new.target != Purchasable) return;
		throw new Error("Cannot instantiate abstract class Purchasable directly.");
	}

	getPrice() {
		throw new Error(
			`Method '${nameof(this.getPrice)}' must be implemented by subclass.`,
		);
	}

	purchase() {
		const price = this.getPrice();
		const canAfford = price <= game.cookies;
		if (!canAfford) return;
		game.cookies -= price;
	}
}
