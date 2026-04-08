import {
	Buildings,
	loadBuildings,
} from "./cookie-clicker/purchasables/building.js";
import Algorithm from "./algorithms/algorithm.js";
import Objective from "./algorithms/objective.js";
import { formatTime, getPlural, remap } from "./utils.js";
import "./algorithms/greedy-naive.js";
import "./algorithms/greedy-payback.js";
import "./algorithms/greedy-payback-time.js";
import "./algorithms/brute-force-segmented.js";
import Decision from "./algorithms/decisions/decision.js";
import GameState from "./cookie-clicker/game-state.js";
import * as numberformat from "https://esm.sh/swarm-numberformat";
import Graph from "./benchmark/graph.js";

// References
const algorithmCount = document.getElementById("algorithm-count");
const algorithmsContainer = document.querySelector(".algorithms");
const form = document.querySelector("form");
const runBtn = form.querySelector("button[type='submit']");

const toast = document.querySelector(".toast");
const toastTitle = toast.querySelector("h2");
const toastMsg = toast.querySelector("p");

// Functions
function updateForm() {
	const count = getActiveAlgorithms();
	if (count <= 0) runBtn.setAttribute("disabled", "disabled");
	else runBtn.removeAttribute("disabled");
	updateAlgorithmSection();
}

function updateAlgorithmSection() {
	// Update count
	const count = getActiveAlgorithms();
	const algorithmCountText = `${count} ${getPlural("algorithm", count)} selected`;
	algorithmCount.textContent = algorithmCountText;
}

function getActiveAlgorithms() {
	const count = document.querySelectorAll("label:has(input:checked)").length;
	return count;
}

/**
 * @param {{
 *   algorithm: Algorithm,
 *   simulationTime: number,
 *   data: Array<{decision: Decision, gameState: GameState}>
 * }[]} results
 */
function displayResults(results) {
	if (results) console.log(results);

	// Table Results
	const tbody = document.querySelector(".result-data > tbody");
	tbody.innerHTML = "";
	for (const r of results || []) {
		const lastData = r.data.at(-1);

		tbody.innerHTML += `
        <tr>
            <td>${r.algorithm.title}</td>
            <td>${numberformat.formatShort(r.benchmarkTime)}</td>
            <td>${numberformat.formatShort(lastData.gameState.simulationTime)}</td>
            <td>${numberformat.formatShort(lastData.gameState.totalCookies)}</td>
            <td>${numberformat.formatShort(lastData.gameState.buildingCpS)}</td>
        </tr>
        `;
	}

	// Graph Results
	const cpsCanvas = document.querySelector("#cps-graph");
	const cookieCanvas = document.querySelector("#cookie-graph");
	const cpsGraph = new Graph(cpsCanvas, "Time (s)", "CpS");
	const cookieGraph = new Graph(cookieCanvas, "Time (s)", "Cookies");

	for (let i = 0; i < results?.length; i++) {
		const r = results[i];
		const label = r.algorithm.title;

		const x = [0];
		const y = [0];
		for (let j = 0; j < r.data.length; j++) {
			const d = r.data[j];

			x.push(d.gameState.simulationTime);
			y.push(d.gameState.buildingCpS);
		}

		cpsGraph.add(label, x, y);
	}

	for (let i = 0; i < results?.length; i++) {
		const r = results[i];
		const label = r.algorithm.title;

		const x = [0];
		const y = [0];
		for (let j = 0; j < r.data.length; j++) {
			const d = r.data[j];
			const isLast = j == r.data.length - 1;

			x.push(d.gameState.simulationTime);
			y.push(d.decision.afterCookies);

			if (isLast) continue;
			x.push(d.gameState.simulationTime);
			y.push(d.decision.beforeCookies);
		}

		cookieGraph.add(label, x, y);
	}

	cpsGraph.draw();
	cookieGraph.draw();
}

/**
 * Show a toast in the lower-right corner of the screen.
 * @param {string} title title of the toast.
 * @param {string} msg message of the toast.
 */
function show(title, msg) {
	toastTitle.textContent = title;
	toastMsg.textContent = msg;
	toast.classList.add("show");
	setTimeout(() => toast.classList.remove("show"), 4000);
}

// Initialize
await loadBuildings();
for (const algorithm of Algorithm.derived) {
	const activeByDefault =
		["GreedyNaive", "GreedyPaybackTime"].findIndex(
			(i) => i === algorithm.name,
		) !== -1;
	algorithmsContainer.innerHTML += `
		<div>
			<label for="${algorithm.name}">${algorithm.title}
				<input type="checkbox" class="hide" id="${algorithm.name}" name="${algorithm.name}" ${activeByDefault ? "checked" : ""} />
			</label>
		</div>
	`;
}

console.log("Buildings", Buildings);
console.log("Algorithms", Algorithm.derived);

// Subscribe to events
form.addEventListener("submit", async (e) => {
	e.preventDefault();

	// Read the form and create an Objective instance right when the user clicks "Run"
	const objective = Objective.fromForm();

	const runBtn = form.querySelector("button[type='submit']");
	console.log("Running Benchmark...");

	runBtn.setAttribute("disabled", "disabled");
	const runBtnText = runBtn.textContent;
	runBtn.textContent = "Running...";

	const results = [];
	for (const algorithm of Algorithm.derived) {
		const active =
			document.querySelector(`#${algorithm.name}:checked`) !== null;

		if (!active) continue;

		const beforeTime = Date.now();
		// Start the algorithm run, passing the objective in.
		const data = await algorithm.instance.run(objective);
		const benchmarkTime = Date.now() - beforeTime;

		results.push({
			algorithm: algorithm,
			benchmarkTime: benchmarkTime,
			data: data,
		});
	}

	displayResults(results);

	runBtn.textContent = runBtnText;
	runBtn.removeAttribute("disabled");
});

form.addEventListener("reset", () => {
	show("Reset", "The form has been reset...");

	// Timeout to push the execution to after values has been reset
	setTimeout(() => {
		updateForm();
	}, 0);
});

form.addEventListener("change", updateForm);
updateForm();
displayResults();
