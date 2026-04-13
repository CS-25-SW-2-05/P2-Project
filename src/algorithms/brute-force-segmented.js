import GameState from "../cookie-clicker/game-state.js";
import Building, {
	cloneBuildings,
	filterValid,
	logBuildingStats,
} from "../cookie-clicker/purchasables/building.js";
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
		//return new PurchaseDecision(gameState, buildings["grandma"]);
		//return new WaitDecision(gameState, wait);
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
	getAllDecisionPermutationsDUMBEDITION(segmentedSearchDepth, permutationArr, decisions){

		let permutationNumber = 0;
		let i = 0, j = 0, k = 0, l = 0, m = 0;
		const S = decisions.length - 1;

		while(true){
			permutationArr[permutationNumber] = [i, j, k, l, m];
			permutationNumber++;

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
	getSegmentSolution(currentGameState, currentBuildings, decisions, segmentedSearchDepth, objective, buildings, gameState, referenceBuildings, referenceGameState){

		let permutationArr = [[]];

		// finds all decision permutations and puts them into decisionArr
		this.getAllDecisionPermutationsDUMBEDITION(
			segmentedSearchDepth, permutationArr, decisions,
		);
		console.log(permutationArr);

		let bestSolution = [permutationArr[0], 100000];
		let tempSolution = [];
		let decision = 0;


		// Runs through all decision permutations and saves the best one
		for(let i = 0; i < 1000; i++){

			//gameState = currentGameState;
			//buildings = currentBuildings;
			//console.log(permutationArr[i]);

			currentGameState.totalCookies = referenceGameState.totalCookies;
			currentGameState.buildingCpS = referenceGameState.buildingCpS;
			currentGameState.realTime = referenceGameState.realTime;


			// Runs through each decision in the permuation
			for(let j = 0; j < permutationArr[i].length; j++){

				console.log("Permuation nr. " + i + " j = " + j + " decision: " + permutationArr[i][j] + " " + decisions[permutationArr[i][j]]);
				if(objective.type !== "cookies"){
					console.log("point reached 1");
					decision = new PurchaseDecision(currentGameState, currentBuildings[decisions[permutationArr[i][j]]]);
					decision.perform();
					logBuildingStats(currentBuildings);
					continue;
				}
				//console.log("Error: can only use production as objective atm");

				
				if(decisions[permutationArr[i][j]] === "wait"){
					// Calculate how long it takes until the cookie objective is reached
					console.log("POINT REACHED 3");
					let waitSaveUpTime = (objective.value - currentGameState.cookies)/currentGameState.cps;
					decision = new WaitDecision(currentGameState, Math.ceil(waitSaveUpTime));
					decision.perform();
					/* 
					if the wait decision is made, the rest of the decisions
					must be removed from the permutation, as the wait decision
					ends the decision chain.
					 */
					for(let l = j; l <= permutationArr[i].length; l++){
						permutationArr[i].pop();
					}
					console.log(permutationArr[i]);
					break;
					
				}
				//console.log("j = " + j);
				//console.log(permutationArr[i][j]);
				//console.log("point reached 2");
				decision = new PurchaseDecision(currentGameState, currentBuildings[decisions[permutationArr[i][j]]]);
				decision.perform();
				logBuildingStats(currentBuildings);
			}
			console.log(permutationArr[i]);
			console.log("permutation nr. " + i + " completed");
			

		}

	}


	// connects the segmented solutions together and returns the final solution
	getBruteForceSegmentedSolution(objective, gameState, buildings){

		let currentGameState = new GameState;
		let currentBuildings = cloneBuildings();


		let referenceGameState = currentGameState.copy();
		let referenceBuildings = cloneBuildings();

		let segmentedSearchDepth = 5;
		let solution = [];
		let decisions = [];
		let i = 0;

		for(let key in currentBuildings){
			decisions[i] = key;
			i++;
		}
		decisions[i] = "wait";
		console.log(decisions);

		//this.getSegmentSolution(currentGameState, currentBuildings, decisions, segmentedSearchDepth, objective, buildings, gameState)
		

		for (let i = 0; i < 1; i++){
			this.getSegmentSolution(currentGameState, currentBuildings, 
			decisions, segmentedSearchDepth, objective, buildings, gameState, referenceBuildings, referenceGameState);


		}

		

		return 1;


	}

}
