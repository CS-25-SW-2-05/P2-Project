import Algorithm from "./algorithm.js";
import Decision from "./decision.js";

export default class GreedyNaive extends Algorithm {
	static algorithmTitle = "[Greedy] Immediate Purchase";
	static dummy = Algorithm.derived.add({
		name: this.name,
		title: this.algorithmTitle,
		instance: new GreedyNaive(),
	});

	getNextDecision(gameState, buildings) {

		// implementer naive greedy algoritme, erstat "buildings["cursor"]" herunder
		return new Decision(gameState, buildings["cursor"]);
	}
}
