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
/*
	getAllDecisionPermutations(segmentedSearchDepth, decisionArr, decisions, permutationMarker, permutation) {

		if(!(permutationMarker === segmentedSearchDepth - 1)){
			this.getAllDecisionPermutations(
				segmentedSearchDepth, decisionArr, decisions, permutationMarker + 1, permutation
			);
		}

		let permutationDepth = (segmentedSearchDepth - 1) - permutationMarker;

		for(let l = segmentedSearchDepth - 1; l < permutationDepth; l++){
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
*/
	//
	getAllDecisionPermutationsDUMBEDITION(segmentedSearchDepth, decisionArr, decisions){

		let solutionNumber = 0;
		let i = 0, j = 0, k = 0, l = 0, m = 0;
		const S = decisions.length;

		while(true){
			decisionArr[solutionNumber] = [i, j, k, l, m];
			solutionNumber++;

			m++;

			if(m == S + 1){
				m = 0;
				l += 1;
			}
			if(l == S + 1){
				l = 0;
				k += 1;
			}
			if(k == S + 1){
				k = 0;
				j += 1;
			}
			if(j == S + 1){
				j = 0;
				i += 1;
			}
			if(i == S + 1){
				break
			}
			//console.log([i, j, k, l, m])
			
		}
		return;
	}



	// finds the solution to each segment
	getSegmentSolution(currentGameState, currentBuildings, decisions, segmentedSearchDepth, objective){

		let decisionArr = [[]];

		// finds all decision permutations and puts them into decisionArr
		this.getAllDecisionPermutationsDUMBEDITION(
			segmentedSearchDepth, decisionArr, decisions,
		);
		console.log(decisionArr);


		let i = 0;
		let bestSolution = decisionArr[0];
		console.log(bestSolution);
		let tempSolution = [];



		// Runs through all decision permutations and saves the best one
		while(false){

			
			decisionArr[i];
			

			i++;




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

		this.getSegmentSolution(currentGameState, currentBuildings, decisions, segmentedSearchDepth, objective)
		
/*
		for (let i = 0; i < segmentedSearchDepth; i++){
			this.getSegmentSolution(currentGameState, currentBuildings, decisions, segmentedSearchDepth)
			


		}

		*/

		return 1;


	}

}
