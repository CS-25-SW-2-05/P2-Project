import Algorithm from "./algorithm.js";
import { buildings } from "../cookie-clicker/purchasables/building.js";
import Decision from "./decision.js";

export default class GreedyPayback extends Algorithm {
	static algorithmTitle = "[Greedy] Payback";
	static dummy = Algorithm.derived.add(this.algorithmTitle);

	getNextDecision() {
		return new Decision(buildings["cursor"]);
	}
}
