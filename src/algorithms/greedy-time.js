import Algorithm from "./algorithm.js";
import Decision from "./decision.js";

export default class GreedyTime extends Algorithm {
	static algorithmTitle = "[Greedy] Save+Payback";
	static dummy = Algorithm.derived.add({
		name: this.name,
		title: this.algorithmTitle,
		instance: new GreedyTime(),
	});

	getNextDecision(game, buildings) {
		return new Decision(game, buildings["cursor"]);
	}
}
