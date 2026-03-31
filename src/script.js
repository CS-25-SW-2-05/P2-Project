import {
	Buildings,
	loadBuildings,
} from "./cookie-clicker/purchasables/building.js";
import Algorithm from "./algorithms/algorithm.js";
import Objective from "./algorithms/objective.js";
import { getPlural, remap } from "./utils.js";
import "./algorithms/greedy-naive.js";
import "./algorithms/greedy-payback.js";
import "./algorithms/greedy-time.js";
import "./algorithms/brute-force-segmented.js";
import Decision from "./algorithms/decisions/decision.js";
import GameState from "./cookie-clicker/game-state.js";
import * as numberformat from "https://esm.sh/swarm-numberformat";

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
 * @param {{
 *   algorithm: Algorithm,
 *   simulationTime: number,
 *   data: Array<{decision: Decision, gameState: GameState}>
 * }[]} results
 */
function displayResults(results) {
	console.log(results);

	const tbody = document.querySelector(".result-data > tbody");
	tbody.innerHTML = "";

	const height = ctx.canvas.height;
	const width = ctx.canvas.width;
	ctx.clearRect(0, 0, width, height);

	const cpsValues = results.flatMap((r) =>
		r.data.map((d) => d.gameState.buildingCpS),
	);
	if (cpsValues.length === 0) {
		console.warn("No CPS data available to compute min/max");
		return;
	}

	const min = Math.min(...cpsValues);
	const max = Math.max(...cpsValues);
	console.log("min:", min);
	console.log("max:", max);

	ctx.font = "24px sans-serif";
	ctx.textBaseline = "top";
	ctx.fillStyle = "white";

	const margin = 8;

	const minY = height - margin - 20;

	for (let i = 0; i <= 10; i++) {
		const pct = i / 10;
		const value = remap(pct, 0, 1, max, min);
		const y = remap(pct, 0, 1, margin, minY);
		const valueText = numberformat.formatShort(value);
		ctx.fillText(valueText, margin, y);
	}

	for (const r of results) {
		const lastData = r.data.at(-1);

		tbody.innerHTML += `
        <tr>
            <td>${r.algorithm.title}</td>
            <td>${numberformat.formatShort(r.simulationTime)}</td>
            <td>${numberformat.formatShort(lastData.gameState.realTime)}</td>
            <td>${numberformat.formatShort(lastData.gameState.totalCookies)}</td>
            <td>${numberformat.formatShort(lastData.gameState.cps)}</td>
        </tr>
        `;

		ctx.beginPath();
		ctx.moveTo(0, height);
		for (let i = 0; i < r.data.length; i++) {
			const d = r.data[i];
			const wPct = i / r.data.length;
			const hPct = d.gameState.buildingCpS / max;

			ctx.lineTo(width * wPct, height - height * hPct);
		}
		ctx.lineWidth = 4;
		ctx.strokeStyle = "red";
		ctx.stroke();
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
				<input type="checkbox" class="hide" id="${algorithm.name}" name="${algorithm.name}" ${algorithm.name === "GreedyNaive" ? "checked" : ""} />
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
			simulationTime: simulationTime,
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
