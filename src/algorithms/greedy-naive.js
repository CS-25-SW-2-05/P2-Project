import Algorithm from "./algorithm.js";
import Decision from "./decision.js";

export default class GreedyNaive extends Algorithm {
	// Dummy to automatically add an instance of the algorithm to the derived set in the Algorithm class.
	static dummy = Algorithm.derived.add({
		name: this.name,
		title: "[Greedy] Immediate Purchase",
		instance: new GreedyNaive(),
	});

	/**
	 * @param {GameState} game the current game state
	 * @param {Building} buildings a list of all buildings, in their current state
	 * @returns {Decision} the next decision to be performed, if it is valid.
	 */
	getNextDecision(gameState, buildings) {
		// implementer naive greedy algoritme, erstat "buildings["cursor"]" herunder
		return new Decision(gameState, buildings["cursor"]);
	}
}
