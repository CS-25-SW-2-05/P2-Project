import GameState from "../../cookie-clicker/game-state.js";

export default class Decision {
	isValid = false;
	beforeCookies = 0;
	afterCookies = 0;
	gameState = null;
	_wait = 0;

	/**
	 * @param {GameState} gameState
	 */
	constructor(gameState) {
		if (new.target == Decision)
			throw new Error("Cannot instantiate abstract class Decision directly.");

		this.gameState = gameState;
	}

	/**
	 * Perform the decision, and update the game state.
	 */
	perform() {
		console.log("Decision:", this);
		this.beforeCookies = this.gameState.cookies;
	}
}
