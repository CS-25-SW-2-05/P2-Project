import {
	Buildings,
	loadBuildings,
} from "./cookie-clicker/purchasables/building.js";
import Algorithm from "./algorithms/algorithm.js";
import Objective from "./algorithms/objective.js";
import { getPlural } from "./utils.js";
import "./algorithms/greedy-naive.js";
import "./algorithms/greedy-payback.js";
import "./algorithms/greedy-time.js";
import "./algorithms/brute-force-segmented.js";

// References
const algorithmCount = document.getElementById("algorithm-count");
const algorithmsContainer = document.querySelector(".algorithms");
const form = document.querySelector("form");
const runBtn = form.querySelector("button[type='submit']");
const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

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
 * @param {{ algorithm: Algorithm, realTime: number, simulationTime: number, totalCookies: number, cps: number}} results
 */
function displayResults(results) {
	const tbody = document.querySelector(".result-data > tbody");
	tbody.innerHTML = "";

	for (const r of results) {
		tbody.innerHTML += `
        <tr>
            <td>${r.algorithm.title}</td>
            <td>${r.simulationTime}ms</td>
            <td>${Math.round(r.realTime)}s</td>
            <td>${r.totalCookies}</td>
            <td>${r.cps}</td>
        </tr>
        `;
	}
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
	algorithmsContainer.innerHTML += `
		<div>
			<label for="${algorithm.name}">${algorithm.title}
				<input type="checkbox" class="hide" id="${algorithm.name}" name="${algorithm.name}" />
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
		const simulationTime = Date.now() - beforeTime;

		results.push({
			algorithm: algorithm,
			realTime: data.realTime,
			simulationTime: simulationTime,
			totalCookies: data.totalCookies,
			cps: data.buildingCpS,
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
