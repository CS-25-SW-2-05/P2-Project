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
import Chart from "https://esm.sh/chart.js/auto";

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

let mainChart = null;
let buildingGraph = null;
let latestBuildingGraphConfig = null;

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

	let buildingConfigGraphData = {
		labels: [],
		datasets: []
	};
	if (results) {
		for (const result of results) {
			const resultLabel = result.algorithm.name;
			const lastGameState = result.data[result.data.length - 1].decision.gameState
			const lastBuildingConfig = lastGameState.buildings;
			const resultData = Object.values(lastBuildingConfig).map(building => building.owned);

			if (buildingConfigGraphData.labels.length === 0) {
				buildingConfigGraphData.labels = Object.keys(lastBuildingConfig);
			}

			buildingConfigGraphData.datasets.push({
				label: resultLabel,
				data: resultData
			});
		}
	}

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
	const buildingCanvas = document.querySelector("#building-graph");
	const buildingGraphConfig = {
		type: "bar",
		data: buildingConfigGraphData,
		options: {
			responsive: true,
			// maintainAspectRatio: false,
			devicePixelRatio: window.devicePixelRatio
		}
	}

	latestBuildingGraphConfig = buildingGraphConfig;
	const cpsChart = new LineChart(cpsCanvas, "Time (s)", "Production (CpS)");
	const cookieChart = new LineChart(cookieCanvas, "Time (s)", "Cookies");

	if (buildingGraph) {
		buildingGraph.destroy();
		buildingGraph = null;
	}

	if (mainChart) {
		mainChart.destroy();
		mainChart = null;
	}

	buildingGraph = new Chart(buildingCanvas, buildingGraphConfig)

	buildingCanvas.style.removeProperty("display");
	buildingCanvas.removeAttribute("style");


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

	cpsChart.draw();
	cookieChart.draw();
	chartContext.drawImage(cpsCanvas, 0, 0);
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
	benchmarkResults.classList.remove("hide");
});

form.addEventListener("reset", () => {
	show("Reset", "The form has been reset...");

	// Timeout to push the execution to after values has been reset
	setTimeout(() => {
		updateForm();
	}, 0);
});

// Show value of range sliders in output element
document
	.querySelectorAll('input[type="range"]')
	.forEach((r) =>
		r.addEventListener("input", () => (r.nextElementSibling.value = r.value)),
	);

// Click preview charts sets contents of big chart
document.querySelectorAll(".previews > canvas").forEach((canvas) => {
	canvas.addEventListener("click", () => {

		if (mainChart) {
			mainChart.destroy();
			mainChart = null;
		}

		chartContext.clearRect(0, 0, chartCanvas.width, chartCanvas.height);

		// If the canvas is the building-graph, then draw chart
		if (canvas.id === "building-graph") {
			mainChart = new Chart(chartCanvas, {
				...latestBuildingGraphConfig,
			});
			chartCanvas.style.removeProperty("display");
			return;
		}

		// Else draw image
		chartContext.drawImage(
			canvas,
			0,
			0,
			canvas.width,
			canvas.height,
			0,
			0,
			chartCanvas.width,
			chartCanvas.height,
		);
	});
});


// Zoom in on chart
chartCanvas.addEventListener("click", () => {
	/** @type {HTMLCanvasElement} */
	const zoomedChart = chartCanvas.cloneNode();
	zoomedChart.getContext("2d").drawImage(chartCanvas, 0, 0);
	document.body.appendChild(zoomedChart);

	zoomedChart.classList.add("zoomed");
	zoomedChart.addEventListener("click", zoomedChart.remove);
});

form.addEventListener("change", updateForm);
updateForm();
