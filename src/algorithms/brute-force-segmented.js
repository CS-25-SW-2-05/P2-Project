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
	getSegmentSolution(currentGameState, decisions, segmentedSearchDepth, objective, buildings, gameState, referenceGameState){

		let permutationArr = [[]];

		// finds all decision permutations and puts them into decisionArr
		this.getAllDecisionPermutationsDUMBEDITION(
			segmentedSearchDepth, permutationArr, decisions,
		);
		console.log(permutationArr);

		let bestSolution = [permutationArr[0], currentGameState.cps];
		let tempSolution = [permutationArr[0], currentGameState.cps];
		let decision = 0;
		let bestSolutionGameState = referenceGameState.copy();


		// Runs through all decision permutations and saves the best one
		for(let i = 0; i < permutationArr.length - 1; i++){

			currentGameState = referenceGameState.copy();

			// Runs through each decision in the permuation
			for(let j = 0; j < permutationArr[i].length; j++){

				//console.log("Permuation nr. " + i + " j = " + j + " decision: " + permutationArr[i][j] + " " + decisions[permutationArr[i][j]]);
				if(objective.type !== "cookies"){
					//console.log("point reached 1");
					decision = new PurchaseDecision(currentGameState, currentGameState.buildings[decisions[permutationArr[i][j]]]);
					decision.perform();
					//logBuildingStats(currentGameState.buildings);
					continue;
				}
				//console.log("Error: can only use production as objective atm");

				
				if(decisions[permutationArr[i][j]] === "wait"){
					// Calculate how long it takes until the cookie objective is reached
					//console.log("POINT REACHED 3");
					let waitSaveUpTime = (objective.value - currentGameState.cookies)/currentGameState.cps;
					decision = new WaitDecision(currentGameState, Math.ceil(waitSaveUpTime));
					decision.perform();
					/* 
					if the wait decision is made, the rest of the decisions
					must be removed from the permutation, as the wait decision
					ends the decision chain.
					 */
					for(let l = j; l < permutationArr[i].length; l++){
						permutationArr[i].pop();
					}
					//console.log(permutationArr[i]);
					break;
					
				}
				//console.log("j = " + j);
				//console.log(permutationArr[i][j]);
				//console.log("point reached 2");
				decision = new PurchaseDecision(currentGameState, currentGameState.buildings[decisions[permutationArr[i][j]]]);
				decision.perform();
				//logBuildingStats(currentGameState.buildings);
			}


			tempSolution = [permutationArr[i], currentGameState.cps/currentGameState.simulationTime];

			if(tempSolution[1] >= bestSolution[1]){
				bestSolution[0] = tempSolution[0];
				bestSolution[1] = tempSolution[1];
				bestSolutionGameState = currentGameState.copy();
			}

			//console.log(permutationArr[i]);
			//console.log("permutation nr. " + i + " completed");
		
			

		}
		referenceGameState = bestSolutionGameState.copy();
		logBuildingStats(referenceGameState.buildings);
		console.log("Best segmentsolution: " + bestSolution[0]);
		return bestSolution[0];

	}


	// connects the segmented solutions together and returns the final solution
	getBruteForceSegmentedSolution(objective, gameState, buildings){

		let currentGameState = new GameState();
		let referenceGameState = currentGameState.copy();

		let segmentedSearchDepth = 5;
		let solution = [];
		let segmentSolution = [];
		let decisions = [];
		let i = 0;

		for(let key in currentGameState.buildings){
			decisions[i] = key;
			i++;
		}
		if(objective.type === "cookies"){
			decisions[i] = "wait";
		}
		console.log(decisions);

		//this.getSegmentSolution(currentGameState, currentBuildings, decisions, segmentedSearchDepth, objective, buildings, gameState)
		

		for (let i = 0; i < 100; i++){
			segmentSolution = this.getSegmentSolution(currentGameState, 
			decisions, segmentedSearchDepth, objective, buildings, gameState, referenceGameState);
			console.log("Segment solution: " + segmentSolution);
			solution.push(...segmentSolution);
			console.log("solution: " + solution);
			


		}

		

		return solution;


	}

}
