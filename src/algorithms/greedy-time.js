import Algorithm from "./algorithm.js";
import Decision from "./decision.js";

export default class GreedyTime extends Algorithm {
	static algorithmTitle = "[Greedy] Save+Payback";
	static dummy = Algorithm.derived.add({
		name: this.name,
		title: this.algorithmTitle,
		instance: new GreedyTime(),
	});

	getNextDecision(gameState, buildings) {

		// implementer "smart" payback greedy algoritme, erstat "buildings["cursor"]" herunder
		return new Decision(gameState, buildings["cursor"]);
	}
}
