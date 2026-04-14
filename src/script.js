import { loadBuildings } from "./cookie-clicker/purchasables/building.js";
import Algorithm from "./algorithms/algorithm.js";
import Objective from "./algorithms/objective.js";
import { getPlural } from "./utils.js";
import "./algorithms/greedy-naive.js";
import "./algorithms/greedy-payback.js";
import "./algorithms/greedy-payback-time.js";
import "./algorithms/brute-force-segmented.js";
import Decision from "./algorithms/decisions/decision.js";
import GameState from "./cookie-clicker/game-state.js";
import * as numberformat from "https://esm.sh/swarm-numberformat";
import LineChart from "./benchmark/line-chart.js";

// References
/** @type {HTMLCanvasElement} */
const chartCanvas = document.querySelector("#chart");
const chartContext = chartCanvas.getContext("2d");
const algorithmCount = document.querySelector("#algorithm-count");
const algorithmsContainer = document.querySelector(".algorithms");
const buildingLengthInput = document.querySelector("#building-length");
const benchmarkResults = document.querySelector(".benchmark-results");
const form = document.querySelector("form");
const runBtn = form.querySelector("button[type='submit']");

const toast = document.querySelector(".toast");
const toastTitle = toast.querySelector("h2");
const toastMsg = toast.querySelector("p");
const stopBtn = document.getElementById("stop-btn");
let isRunning = false;
let selectedCanvas = null;

// Functions
function updateForm() {
	if (isRunning) return;
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

	// Chart Results
	const cpsCanvas = document.querySelector("#cps-chart");
	const cookieCanvas = document.querySelector("#cookie-chart");
	const cpsChart = new LineChart(cpsCanvas, "Time (s)", "Production (CpS)");
	const cookieChart = new LineChart(cookieCanvas, "Time (s)", "Cookies");

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

		cpsChart.add(label, x, y);
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

		cookieChart.add(label, x, y);
	}

	if (selectedCanvas == null) selectedCanvas = cpsCanvas;
	cpsChart.draw();
	cookieChart.draw();
	chartContext.drawImage(selectedCanvas, 0, 0);
}

/**
 * Show a toast in the lower-right corner of the screen.
 * @param {string} title title of the toast.
 * @param {string} msg message of the toast.
 */
let toastCounter = 0;
function show(title, msg) {
	toastCounter++;
	toastTitle.textContent = title;
	toastMsg.textContent = msg;
	toast.classList.add("show");
	setTimeout(() => {
		toastCounter--;
		if (toastCounter !== 0) return;
		toast.classList.remove("show");
	}, 4000);
}

// Initialize
for (const algorithm of Algorithm.derived) {
	const activeByDefault =
		["GreedyNaive", "GreedyPaybackTime", "GreedyPayback"].findIndex(
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

console.log("Algorithms", Algorithm.derived);

// Subscribe to events
form.addEventListener("submit", async (e) => {
	e.preventDefault();

	isRunning = true;

	// Read the form and create an Objective instance right when the user clicks "Run"
	const objective = Objective.fromForm();

	const runBtn = form.querySelector("button[type='submit']");
	console.log("Running Benchmark...");

	runBtn.setAttribute("disabled", "disabled");
	const runBtnText = runBtn.textContent;
	runBtn.textContent = "Running...";

	const buildingLength = buildingLengthInput.valueAsNumber;
	await loadBuildings(buildingLength);

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
	stopBtn.setAttribute("disabled", "disabled");
});

stopBtn.addEventListener("click", () => {
	for (const algorithm of Algorithm.derived) {
		const active = document.querySelector(`#${algorithm.name}:checked`) !== null;
		if (!active) continue;
		algorithm.instance.stop();
	}
	show("Stopped", "The simulation was stopped by user.");
	setTimeout(() => {
		updateForm();
	})
	benchmarkResults.classList.remove("hide");
	isRunning = false;
});

form.addEventListener("reset", () => {
	show("Reset", "The form has been reset...");
	runBtn.removeAttribute("disabled");
	const runBtnText = runBtn.textContent;
	runBtn.textContent = "Run Benchmark";

	// Timeout to push the execution to after values has been reset
	setTimeout(() => {
		updateForm();
	}, 0);
});

// Show value of range sliders in output element
document.querySelectorAll('input[type="range"]').forEach((r) => {
	r.addEventListener("input", () => (r.nextElementSibling.value = r.value));
	r.nextElementSibling.value = r.value;
});

// Click preview charts sets contents of big chart
document.querySelectorAll(".previews > canvas").forEach((c) =>
	c.addEventListener("click", () => {
		chartContext.drawImage(c, 0, 0);
		selectedCanvas = c;
	}),
);

// Zoom in on chart
chartCanvas.addEventListener("click", () => {
	/** @type {HTMLCanvasElement} */
	const zoomedChart = chartCanvas.cloneNode();
	zoomedChart.removeAttribute("id");
	zoomedChart.getContext("2d").drawImage(chartCanvas, 0, 0);
	document.body.appendChild(zoomedChart);

	zoomedChart.classList.add("zoomed");
	zoomedChart.addEventListener("click", zoomedChart.remove);
});

form.addEventListener("change", updateForm);
updateForm();
