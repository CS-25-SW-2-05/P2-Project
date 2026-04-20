import Decision from "./decision.js";

export default class PurchaseDecision extends Decision {
    purchaseable = null;

    /**
     * @param {GameState} gameState
     * @param {Purchasable} purchaseable
     */
    constructor(gameState, purchaseable) {
        super(gameState);

        this.purchaseable = purchaseable;
        this.wait = purchaseable.cost / gameState.cps;
        this.isValid =
            this.purchaseable != null &&
            this.purchaseable.canPurchase() &&
            this.wait > 0;
    }

    perform() {
        super.perform();
        this.cookiesBefore = this._gameState.cookies;
        this._gameState.simulationTime += this.wait;
        this._gameState.cookies += this.purchaseable.cost;
        this.cookiesAfter = this._gameState.cookies;

        const wasSuccesful = this.purchaseable.purchase(this._gameState);
        this.cpsAfter = this._gameState.buildingCpS;
        console.log("Result:", this._gameState);
        return wasSuccesful;
    }
}
