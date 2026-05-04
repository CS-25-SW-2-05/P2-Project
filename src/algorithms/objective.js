import GameState from "../cookie-clicker/game-state.js";

// Exportable class, so other files can acces/import
export default class Objective {
    // Objective value: e.g. 1000
    value = 0;
    // Objective type: e.g. "cookies" | "production" | "time limit"
    type = null;

    /**
     * This runs, when you do "new Objective(type, value)"
     * @param {"cookies" | "production" | "time limit"} type
     * @param {number} value
     */
    constructor(type, value) {
        // Save type and value into private field
        this.type = type;
        // Save, an convert to number since form values are strings
        this.value = Number(value);
    }

    /**
     * Method that checks if the game has reached the objective (does not run here).
     * @param {GameState} gameState the current game state.
     * @returns {boolean} whether the objective has been reached.
     */
    isCompleted(gameState) {
        // If type is "cookies", check gameState.cookies against this.value
        if (this.type === "cookies") return gameState.cookies >= this.value;

        // If type is "production", check gameState.buildingcps against this.#value
        if (this.type === "production")
            return gameState.buildingCpS >= this.value;

        if (
            this.type === "fixed-time-cookies" ||
            this.type === "fixed-time-production"
        )
            return gameState.simulationTime >= this.value;

        // If type is unknown return false (not completed)
        return false;
    }

    /**
     * Static method, meaning you call it on the class itself: Objective.fromForm(). \
     * It read the form and creates a already made Objective instance.
     * @returns {Objective} a new object instance from the form contents.
     */
    static fromForm() {
        // Read the form values:
        // Read the objective type
        const type = document.getElementById("objective-type").value;
        // Read the objective value
        const value = document.getElementById("objective-value").value;
        // Create and return a new Objective using those two values
        return new Objective(type, value);
    }
}
