import { Buildings } from "./purchasables/building.js";

export default class GameState {
	cookies = 0;
	cps = 6;
	realTime = 0;

	reset() {
		this.cookies = 0;
		this.cps = 6;
		this.realTime = 0;

		for (const key of Object.keys(Buildings)) {
			Buildings[key].owned = 0;
			Buildings[key].cost = Buildings[key].baseCost;
		}
	}
}
