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
        super.perform();
        this.cookiesBefore = this._gameState.cookies;
        this._gameState.simulationTime += this.wait;
        this._gameState.cookies += this._gameState.cps * this.wait;
        this.cookiesAfter = this._gameState.cookies;
        this.cpsAfter = this._gameState.buildingCpS;

        console.log("Result:", this._gameState);
        return true;
    }
}
