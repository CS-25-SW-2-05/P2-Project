import {
	Buildings,
	loadBuildings,
} from "./cookie-clicker/purchasables/building.js";
import Algorithm from "./algorithms/algorithm.js";
import Objective from "./algorithms/objective.js";
import { getPlural, remap } from "./utils.js";
import "./algorithms/greedy-naive.js";
import "./algorithms/greedy-payback.js";
import "./algorithms/greedy-payback-time.js";
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
	if (results) console.log(results);

	// Table Results
	const tbody = document.querySelector(".result-data > tbody");
	tbody.innerHTML = "";
	for (const r of results || []) {
		const lastData = r.data.at(-1);

		tbody.innerHTML += `
        <tr>
            <td>${r.algorithm.title}</td>
            <td>${numberformat.formatShort(r.simulationTime)}</td>
            <td>${numberformat.formatShort(lastData.gameState.realTime)}</td>
            <td>${numberformat.formatShort(lastData.gameState.totalCookies)}</td>
            <td>${numberformat.formatShort(lastData.gameState.buildingCpS)}</td>
        </tr>
        `;
	}

	// Graph Results
	const graphColors = ["#1447e6", "#00bc7d", "#fe9a00", "#ad46ff", "#ff2056"];

	const height = ctx.canvas.height;
	const width = ctx.canvas.width;

	const cpsValues = results?.flatMap((r) =>
		r.data.map((d) => d.gameState.buildingCpS),
	);

	const minValue = Math.min(...(cpsValues || []));
	const maxValue = Math.max(...(cpsValues || []));
	const maxLength = Math.max(...(results?.flatMap((r) => r.data.length) || []));

	const margin = { t: 64, b: 128, l: 160, r: 64 };

	const clear = () => {
		const color = getComputedStyle(canvas).getPropertyValue("--accent").trim();
		ctx.fillStyle = color;
		ctx.fillRect(0, 0, width, height);
	};

	const drawGrid = () => {
		ctx.beginPath();
		for (let i = 0; i < 10; i++) {
			const pct = i / 9;
			const x = (width - margin.l - margin.r) * pct + margin.l;
			const y = (height - margin.t - margin.b) * pct + margin.t;

			// Horizontal Line
			ctx.moveTo(margin.l, y);
			ctx.lineTo(width - margin.r, y);

			// Vertical Line
			ctx.moveTo(x, margin.t);
			ctx.lineTo(x, height - margin.b);
		}

		const color = getComputedStyle(canvas).getPropertyValue("--border").trim();
		ctx.strokeStyle = color;
		ctx.lineWidth = 2;
		ctx.stroke();
	};

	const drawYLabels = () => {
		for (let i = 0; i < 10; i++) {
			const pct = i / (10 - 1);

			const value = remap(pct, 0, 1, maxValue, minValue);
			const valueText = numberformat.formatShort(value);
			const measure = ctx.measureText(valueText);

			const x = margin.l - measure.actualBoundingBoxRight - 12;
			const y =
				remap(pct, 0, 1, margin.t, height - margin.b) -
				measure.actualBoundingBoxDescent * 0.5;
			ctx.fillText(valueText, x, y);
		}
	};

	const drawXLabels = () => {
		for (let i = 0; i < 10; i++) {
			const pct = i / (10 - 1);

			const value = remap(pct, 0, 1, 0, maxLength);
			const valueText = numberformat.formatShort(value);
			const measure = ctx.measureText(valueText);

			const x =
				remap(pct, 0, 1, margin.l, width - margin.r) -
				measure.actualBoundingBoxRight * 0.5;
			const y = height - margin.b + 12;
			ctx.fillText(valueText, x, y);
		}
	};

	const drawLabels = () => {
		if (!results) return;

		ctx.font = "24px sans-serif";
		ctx.textBaseline = "top";
		ctx.fillStyle = "white";

		drawXLabels();
		drawYLabels();
	};

	const drawDataLines = () => {
		for (let i = 0; i < results?.length; i++) {
			const r = results[i];

			ctx.beginPath();
			ctx.moveTo(margin.l, height - margin.b);
			for (let j = 0; j < r.data.length; j++) {
				const d = r.data[j];
				const wPct = j / (maxLength - 1);
				const hPct = d.gameState.buildingCpS / maxValue;
				const x = (width - margin.l - margin.r) * wPct + margin.l;
				const y = height - margin.b - (height - margin.t - margin.b) * hPct;

				ctx.lineTo(x, y);
			}
			ctx.lineWidth = 4;
			ctx.strokeStyle = graphColors[i];
			ctx.stroke();
		}
	};

	const drawGraph = () => {
		clear();
		drawGrid();
		drawDataLines();
		drawLabels();
	};

	drawGraph();
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
displayResults();
