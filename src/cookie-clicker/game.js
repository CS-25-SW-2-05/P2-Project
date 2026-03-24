import { buildings } from "./purchasables/building.js";

class Game {
	cookies = 0;
	cps = 6;
	realTime = 0;

	reset() {
		this.cookies = 0;
		this.cps = 6;
		this.realTime = 0;

		for (const key of Object.keys(buildings)) {
			buildings[key].owned = 0;
			buildings[key].cost = buildings[key].baseCost;
		}
	}
}

const game = new Game();
export default game;
