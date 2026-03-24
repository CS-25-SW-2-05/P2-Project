class Purchaseable {
	constructor() {
		if (new.target != Purchaseable) return;
		throw new Error("Cannot instantiate abstract class Purchaseable directly.");
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
