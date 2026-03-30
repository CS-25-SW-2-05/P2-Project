import GameState from "../../cookie-clicker/game-state.js";

export default class Decision {
	isValid = false;
	_gameState = null;
	_wait = 0;

	/**
	 * @param {GameState} gameState
	 */
	constructor(gameState) {
		if (new.target == Decision)
			throw new Error("Cannot instantiate abstract class Decision directly.");

		this._gameState = gameState;
	}

	/**
	 * Perform the decision, and update the game state.
	 */
	perform() {
		throw new Error(
			`Method '${this.perform.name}' must be implemented by subclass.`,
		);
	}
}
