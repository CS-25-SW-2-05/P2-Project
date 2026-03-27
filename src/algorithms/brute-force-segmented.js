import Algorithm from "./algorithm.js";
import Decision from "./decision.js";

export default class BruteForceSegmented extends Algorithm {
	static algorithmTitle = "[Brute Force] Segmented";
	static dummy = Algorithm.derived.add({
		name: this.name,
		title: this.algorithmTitle,
		instance: new BruteForceSegmented(),
	});

	getNextDecision(game, buildings) {
		return new Decision(game, buildings["cursor"]);
	}
}
