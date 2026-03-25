import Algorithm from "./algorithm.js";
import Decision from "./decision.js";

export default class GreedyPayback extends Algorithm {
	static algorithmTitle = "[Greedy] Payback";
	static dummy = Algorithm.derived.add({
		name: this.name,
		title: this.algorithmTitle,
		instance: new GreedyPayback(),
	});

	getNextDecision(game, buildings) {
		return new Decision(game, buildings["cursor"]);
	}
}
