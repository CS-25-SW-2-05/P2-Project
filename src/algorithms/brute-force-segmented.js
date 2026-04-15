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
	getNextDecision(j, solutionArr, gameState, decisions, objective) {
		// Wait decision
		if(decisions[solutionArr[j]] === "wait"){
			//Calculates how long it takes to achieve the objective cookie value
			let waitTime = (objective.value - gameState.cookies)/gameState.cps;
			return new WaitDecision(gameState, Math.ceil(waitTime));
		}
		//Purchase decision
		return new PurchaseDecision(gameState, gameState.buildings[decisions[solutionArr[j]]]);
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
	getAllDecisionPermutationsBASICEDITION(permutationArr, decisions){

		let permutationNumber = 0;
		let i = 0, j = 0, k = 0, l = 0, m = 0;
		const S = decisions.length - 1;

		while(true){

			if(m == S + 1){
				m = 0;
				l += 1;
				continue;
			}
			if(l == S + 1){
				l = 0;
				k += 1;
				continue;
			}
			if(k == S + 1){
				k = 0;
				j += 1;
				continue;
			}
			if(j == S + 1){
				j = 0;
				i += 1;
				continue;
			}
			if(i == S + 1){
				continue;
			}
			if(
				i === S &&
				j === S &&
				k === S &&
				l === S && 
				m === S
			){
				permutationArr[permutationNumber] = [i, j, k, l, m];
				break;
			}

			permutationArr[permutationNumber] = [i, j, k, l, m];
			permutationNumber++;
			m++;
			//console.log([i, j, k, l, m])
		}
		return;
	}

	// finds the solution to each segment
	getSegmentSolution(
		currentGameState, 
		decisions, 
		segmentedSearchDepth, 
		objective,
		referenceGameState, 
		bestSolutionGameState
	){
		let permutationArr = [[]];

		// finds all decision permutations and puts them into decisionArr
		this.getAllDecisionPermutationsBASICEDITION(permutationArr, decisions);
		console.log(permutationArr);


		let waitTime = 0;
		let objectiveWaitTime = 0;
		let decision = 0;
		let bestSolution = [permutationArr[0], currentGameState.cps];
		let tempSolution = [permutationArr[0], currentGameState.cps];

		// Runs through all decision permutations and saves the best one
		for(let i = 0; i < permutationArr.length - 1; i++){
			currentGameState = referenceGameState.copy();
			waitTime = 0;

			// Runs through each decision in the permuation
			for(let j = 0; j < permutationArr[i].length - 1; j++){
				
				//console.log("Permuation nr. " + i + " j = " + j + " decision: " + permutationArr[i][j] + " " + decisions[permutationArr[i][j]]);
				if(objective.type !== "cookies"){
					//console.log("point reached 1");
					waitTime += (currentGameState.buildings[decisions[permutationArr[i][j]]].cost - currentGameState.cookies)/currentGameState.cps;
					decision = new PurchaseDecision(currentGameState, currentGameState.buildings[decisions[permutationArr[i][j]]]);
					decision.perform();
					//logBuildingStats(currentGameState.buildings);

					/*
					if the production objective is reached, a marker is added at the end 
					of the permutation, which corresponds to the last decision number + 1
					*/
					if(currentGameState.cps >= objective.value){
						for(let l = j; l < permutationArr[i].length - 1; l++){
							permutationArr[i].pop();
						}
						permutationArr[i].push(decisions.length);
						//console.log("point 1 reached: " + permutationArr[i]);
						break;
					}
					
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
					for(let l = j; l < permutationArr[i].length - 1; l++){
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

			//console.log(waitTime);
			objectiveWaitTime = (objective.value - currentGameState.cookies)/currentGameState.cps;
			tempSolution = [permutationArr[i], currentGameState.cps/currentGameState.simulationTime, currentGameState.simulationTime, objectiveWaitTime];

			if(i === 0){
				bestSolution[0] = tempSolution[0];
				bestSolution[1] = tempSolution[1];
				bestSolution[2] = tempSolution[2];
				bestSolution[3] = tempSolution[3];
				continue;
			}

			/* 
			If there is a permutation with a wait marker, the wait time to reach 
			the objective value is used for evaluating the better solution
			*/
			if(permutationArr[i][permutationArr[i].length - 1] === decisions.length){
				if(tempSolution[2] <= bestSolution[2]){
					bestSolution[0] = tempSolution[0];
					bestSolution[1] = tempSolution[1];
					bestSolution[2] = tempSolution[2];
					bestSolution[3] = tempSolution[3];
					//console.log(tempSolution[0]);
					bestSolutionGameState = currentGameState.copy();
					//console.log("Best solution buildings: ");
					//logBuildingStats(bestSolutionGameState.buildings);
				}
				continue;
			}

			if(tempSolution[1] >= bestSolution[1]){
				bestSolution[0] = tempSolution[0];
				bestSolution[1] = tempSolution[1];
				bestSolution[2] = tempSolution[2];
				bestSolution[3] = tempSolution[3];
				bestSolutionGameState = currentGameState.copy();
				//console.log("Best solution buildings: ");
				//logBuildingStats(bestSolutionGameState.buildings);
			}

			//console.log(permutationArr[i]);
			//console.log("permutation nr. " + i + " completed");
		}

		logBuildingStats(referenceGameState.buildings);
		console.log("Best segmentsolution: " + bestSolution[0]);
		let returnValue = [bestSolution[0], bestSolutionGameState];
		return returnValue;
	}

	// connects the segmented solutions together and returns the final solution
	getBruteForceSegmentedSolution(objective, decisions){

		let currentGameState = new GameState();
		console.log(currentGameState.buildings);
		let referenceGameState = currentGameState.copy();
		let bestSolutionGameState = referenceGameState.copy();
		let segmentedSearchDepth = 5;
		let segmentSolutionData = [];
		let segmentSolution = [];
		let solution = [];
		let endMarker = 0;

		if(objective.type === "production"){
			for (let i = 0; endMarker !== decisions.length /*i < 2*/; i++){
				segmentSolutionData = this.getSegmentSolution(
				currentGameState, 
				decisions, 
				segmentedSearchDepth, 
				objective, 
				referenceGameState, 
				bestSolutionGameState
			);

				segmentSolution = segmentSolutionData[0];
				referenceGameState = segmentSolutionData[1].copy();

				console.log("Segment solution: " + segmentSolution);

				solution.push(...segmentSolution);
				endMarker = solution[solution.length - 1];

				console.log("solution: " + solution);
				console.log("best solution state: ");
				logBuildingStats(segmentSolutionData[1].buildings);
				console.log("reference game state: ");
				logBuildingStats(referenceGameState.buildings);
			}

			console.log("Final solution: " + solution);
			return solution;
		}
		

		for (let i = 0; i < 3; i++){
			segmentSolutionData = this.getSegmentSolution(
			currentGameState, 
			decisions, 
			segmentedSearchDepth, 
			objective, 
			referenceGameState, 
			bestSolutionGameState
		);
			segmentSolution = segmentSolutionData[0];
			referenceGameState = segmentSolutionData[1].copy();

			console.log("Segment solution: " + segmentSolution);

			solution.push(...segmentSolution);

			console.log("solution: " + solution);
			console.log("best solution state: ");
			logBuildingStats(segmentSolutionData[1].buildings);
			console.log("reference game state: ");
			logBuildingStats(referenceGameState.buildings);
		}
	
		console.log("Final solution: " + solution);
		return solution;
	}
}
