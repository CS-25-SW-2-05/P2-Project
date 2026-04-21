import Decision from "./decision.js";

export default class WaitDecision extends Decision {
    /**
     * @param {GameState} gameState
     * @param {number} wait
     */
    constructor(gameState, wait) {
        super(gameState);

        this.wait = wait;
        this.isValid = this.wait > 0;
    }

    perform() {
        this._gameState.simulationTime += this.wait;

        this.cookiesBefore = this._gameState.cookies;
        this.cpsAfter = this._gameState.buildingCpS;

        this._gameState.cookies += this._gameState.cps * this.wait;

        this.cpsBefore = this._gameState.buildingCpS;
        this.cookiesAfter = this._gameState.cookies;

        return true;
    }
}
