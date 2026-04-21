import GameState from "../../cookie-clicker/game-state.js";

export default class Decision {
    isValid = false;
    cookiesBefore = 0;
    cookiesAfter = 0;
    cpsBefore = 0;
    cpsAfter = 0;
    _gameState = null;
    wait = 0;

    /**
     * @param {GameState} gameState
     */
    constructor(gameState) {
        if (new.target === Decision)
            throw new Error(
                "Cannot instantiate abstract class Decision directly.",
            );

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
