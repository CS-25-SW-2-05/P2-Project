import Algorithm from "./algorithm.js";
import Decision from "./decision.js";

export default class GreedyNaive extends Algorithm {
	static algorithmTitle = "[Greedy] Immediate Purchase";
	static dummy = Algorithm.derived.add({
		name: this.name,
		title: this.algorithmTitle,
		instance: new GreedyNaive(),
	});

	getNextDecision(game, buildings) {
		return new Decision(game, buildings["cursor"]);
	}
}
