import Algorithm from "./algorithm.js";
import { buildings } from "../cookie-clicker/purchasables/building.js";
import Decision from "./decision.js";

export default class GreedyNaive extends Algorithm {
	getNextDecision() {
		return new Decision(buildings["cursor"]);
	}
}
