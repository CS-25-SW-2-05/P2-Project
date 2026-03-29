import GameState from "../cookie-clicker/game-state.js";

// Exportable class, so other files can acces/import
export default class Objective{
    // Private value: e.g. 1000
    #value = 0;
    // Private type: e.g. "cookies" | "production"
    #type = null;

    // This runs, when you do "new Objective(type, value)"
    constructor(type, value){
        // Save type and value into private field
        this.#type = type;
        // Save, an convert to number since form values are strings
        this.#value = Number(value);
    }

    // Method that checks if the game has reached the objective (does not run here)
    isCompleted(gameState){
        // If type is "cookies", check gameState.cookies against this.#value
        if(this.#type == "cookies"){
            return gameState.cookies >= this.#value;
        }
        // If type is "production", check gameState.cps against this.#value
        if(this.#type == "production"){
            return gameState.cps >= this.#value;
        }
        // If type is unknown return false (not completed)
        return false;
    }

    // Static method, meaning you call it on the class itself: Objective.fromForm()
    // It read the form and creates a already made Objective instance
    static fromForm(){
        // Read the form values:
        // Read the objective type
        const type = document.getElementById("objective-type").value
        // Read the objective value
        const value = document.getElementById("objective-value").value
        // Create and return a new Objective using those two values
        return new Objective(type, value);
    }
}