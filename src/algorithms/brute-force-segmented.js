import GameState from "../cookie-clicker/game-state.js";
import Building from "../cookie-clicker/purchasables/building.js";
import Algorithm from "./algorithm.js";
import Decision from "./decisions/decision.js";
import PurchaseDecision from "./decisions/purchase-decision.js";
import WaitDecision from "./decisions/wait-decision.js";

export default class BruteForceSegmented extends Algorithm {
	// Dummy to automatically add an instance of the algorithm to the derived set in the Algorithm class.
	static dummy = Algorithm.derived.add({
		name: this.name,
		title: "[Brute Force] Segmented",
		instance: new BruteForceSegmented(),
	});

	/**
	 * @param {GameState} game the current game state
	 * @param {Building} buildings a list of all buildings, in their current state
	 * @returns {Decision} the next decision to be performed, if it is valid.
	 */



	getNextDecision(gameState, buildings, objective) {
		return new PurchaseDecision(gameState, buildings["grandma"]);
		return new WaitDecision(gameState, wait);
	}

	getAllDecisionPermutations(segmentedSearchDepth, decisionArr, decisions, permutationMarker, permutation) {

		if(!(permutationMarker === segmentedSearchDepth - 1)){
			this.getAllDecisionPermutations(
				segmentedSearchDepth, decisionArr, decisions, permutationMarker + 1, permutation
			);
		}

		let permutationDepth = (segmentedSearchDepth - 1) - permutationMarker;

		for(let l = 0; l < permutationDepth; l++){
			for(let k = 0; k < decisions.length; k++){
				permutation[permutationMarker] = k;
				console.log(permutation);
				decisionArr.push(permutation);
				
			}
		permutation[permutationMarker] = 0;
		}
		for(let k = 0; k < decisions.length; k++){
			permutation[permutationMarker] = k;
			console.log(permutation);
			decisionArr.push(permutation);
		}
		permutation[permutationMarker] = 0;
		return;
	}





	// finds the solution to each segment
	getSegmentSolution(currentGameState, currentBuildings, decisions, segmentedSearchDepth){


		let decisionArr = [];
		let permutation = [];
				
		for (let j = 0; j < segmentedSearchDepth; j++){
			decisionArr[j] = [];
		}

		for (let j = 0; j < segmentedSearchDepth; j++){
			permutation[j] = 0;
		}

		let permutationMarker = 0;

		this.getAllDecisionPermutations(
			segmentedSearchDepth, decisionArr, decisions, permutationMarker, permutation
		);

		console.log(decisionArr);


		//
		/*
		for (let j = 0; j < segmentedSearchDepth; j++){
			decisionArr[j] = 0;
		}
		*/

		// find all decision permutations
		




		while(false){
			if(
				decisionArr


			){}




		}

	}


	// connects the segmented solutions together and returns the final solution
	getBruteForceSegmentedSolution(objective, gameState, buildings){

		let currentGameState = gameState;
		let currentBuildings = buildings;
		let segmentedSearchDepth = 5;
		let solution = [];
		let decisions = [];
		let i = 0;

		for(let key in buildings){
			decisions[i] = key;
			i++;
		}
		decisions[i] = "wait";
		console.log(decisions);

		

		for (let i = 0; i < segmentedSearchDepth; i++){
			this.getSegmentSolution(currentGameState, currentBuildings, decisions, segmentedSearchDepth)
			


		}

		

		return 1;


	}

}
