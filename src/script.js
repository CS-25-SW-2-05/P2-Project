import { loadBuildings } from "./cookie-clicker/purchasables/building.js";
import Algorithm from "./algorithms/algorithm.js";
import Objective from "./algorithms/objective.js";
import { getPlural, round, formatLabel } from "./utils.js";
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
const greedyAlgorithmsContainer = document.querySelector(".greedy-algorithms");
const bruteForceAlgorithmsContainer = document.querySelector(
    ".brute-force-algorithms",
);
const buildingLengthInput = document.querySelector("#building-length");
const clicksPerSecondInput = document.querySelector("#clicks-per-second");
const benchmarkResults = document.querySelector(".benchmark-results");
/** @type {HTMLFormElement} */
const form = document.querySelector("form");
/** @type {HTMLButtonElement} */
const runBtn = form.querySelector("button[type='submit']");

const channel = new BroadcastChannel("cookie_timeline");
const toast = document.querySelector(".toast");
const toastTitle = toast.querySelector("h2");
const toastMsg = toast.querySelector("p");
let isRunning = false;
let selectedCanvas = null;

let mainChart = null;
let buildingGraph = null;
let latestBuildingGraphConfig = null;
let isBuildingGraphSelected = false;
let isZoomedChartDisplayed = false;

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

function getBuildingGraphData(results) {
    // Creating object to contain data and config for buildingGraph
    const buildingConfigGraphData = {
        labels: [],
        datasets: [],
    };

    // Convert benchmark results into Chart.js format by extracting owned buildings
    // from the final game state of each algorithm run
    if (!results) return buildingConfigGraphData;

    // for each algorithm
    for (const result of results) {
        // Get the algorithm label
        const resultLabel = formatLabel(result.algorithm.name);

        // Get the gamestate from the last decision
        const lastGameState = result.data[result.data.length - 1].gameState;

        // Get the building config from the gamestate
        const lastBuildingConfig = lastGameState.buildings;

        // Make a list of the number owned og each building in the gamestate
        const resultData = Object.values(lastBuildingConfig).map(
            (building) => building.owned,
        );

        // Construct a list of building name labels, if it hasn't been done already
        if (buildingConfigGraphData.labels.length === 0) {
            buildingConfigGraphData.labels =
                Object.keys(lastBuildingConfig).map(formatLabel);
        }

        // Push the dataset for the algorithm
        buildingConfigGraphData.datasets.push({
            label: resultLabel,
            data: resultData,
        });
    }

    return buildingConfigGraphData;
}

// Config for buildingChart
function getBuildingGraphConfig(buildingConfigGraphData, canvas) {
    return {
        type: "bar",
        data: buildingConfigGraphData,
        options: {
            responsive: true,
            animation: false,
            devicePixelRatio: window.devicePixelRatio,
            scales: {
                x: {
                    ticks: {
                        color: "white",
                    },
                    grid: {
                        color: getComputedStyle(canvas)
                            .getPropertyValue("--border")
                            .trim(),
                    },
                },
                y: {
                    ticks: {
                        color: "white",
                    },
                    grid: {
                        color: getComputedStyle(canvas)
                            .getPropertyValue("--border")
                            .trim(),
                    },
                },
            },
            plugins: {
                title: {
                    text: "Building configuration",
                    display: true,
                    color: "white",
                    font: {
                        size: 20,
                    },
                },
                legend: {
                    labels: {
                        color: "white",
                    },
                },
            },
        },
    };
}

// Converts a canvas to an image
function drawCanvasInPreview(sourceCanvas, previewCanvas) {
    const context = previewCanvas.getContext("2d");

    context.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
    context.drawImage(
        sourceCanvas,
        0,
        0,
        sourceCanvas.width,
        sourceCanvas.height,
        0,
        0,
        previewCanvas.width,
        previewCanvas.height,
    );
}

function updateBuildingGraphPreview(buildingConfigGraphData, buildingCanvas) {
    // Init config for the preview graph
    const previewGraphConfig = getBuildingGraphConfig(
        buildingConfigGraphData,
        buildingCanvas,
    );
    previewGraphConfig.options.responsive = false;

    // Create a temp canvas
    const tempCanvas = document.createElement("canvas");

    // Set the height and width according to rectangle from chartCanvas
    tempCanvas.width = chartCanvas.width;
    tempCanvas.height = chartCanvas.height;

    // Create a temp chart
    const tempChart = new Chart(tempCanvas, previewGraphConfig);
    tempChart.update();

    // Draw it in the preview canvas
    drawCanvasInPreview(tempCanvas, buildingCanvas);
    tempChart.destroy();
}

/**
 * @param {{
 *   algorithm: Algorithm,
 *   simulationTime: number,
 *   data: Array<{decision: Decision, gameState: GameState}>
 * }[]} results
 * @param {Objective} objective
 */
function displayResults(results, objective) {
    if (results) console.log(results);

    // Table Results
    const tbody = document.querySelector(".result-data > tbody");
    tbody.innerHTML = "";
    for (const r of results || []) {
        const lastData = r.data.at(-1);

        tbody.innerHTML += `
        <tr>
            <td>
                <div>
                    <a>
                        <img src="./images/open_in_new.svg" alt="Open in New" />
                    </a>
                    ${r.algorithm.title}
                </div>
            </td>
            <td>${numberformat.formatShort(r.data.length)}</td>
            <td>${round((r.benchmarkTime * 1000) / r.data.length, 1)}</td>
            <td>${round(r.benchmarkTime, 0)}</td>
            <td>${numberformat.formatShort(lastData.gameState.simulationTime)}</td>
            <td>${numberformat.formatShort(lastData.gameState.buildingCpS)}</td>
            <td>${numberformat.formatShort(lastData.gameState.cookies)}</td>
            <td>${numberformat.formatShort(lastData.gameState.totalCookies)}</td>
        </tr>
        `;
    }

    // Chart Results
    const cpsCanvas = document.querySelector("#cps-chart");
    const cookieCanvas = document.querySelector("#cookie-chart");
    const buildingCanvas = document.querySelector("#building-graph");

    const cpsChart = new LineChart(
        cpsCanvas,
        "Production Over Time",
        "Time (s)",
        "Production (CpS)",
        objective.type === "production" ? objective.value : null,
    );
    const cookieChart = new LineChart(
        cookieCanvas,
        "Cookies Over Time",
        "Time (s)",
        "Cookies",
        objective.type === "cookies" ? objective.value : null,
    );

    // Destroy mainchart or buildinggraph if they exist

    if (mainChart) {
        mainChart.destroy();
        mainChart = null;
    }

    if (buildingGraph) {
        buildingGraph.destroy();
        buildingGraph = null;
    }

    // Get building graph data from results
    const buildingConfigGraphData = getBuildingGraphData(results);

    // Make a config for the chart, and input the building graph data
    const buildingGraphConfig = getBuildingGraphConfig(
        buildingConfigGraphData,
        buildingCanvas,
    );

    // Update latest graph config global variable
    latestBuildingGraphConfig = buildingGraphConfig;

    // Update the building graph preview
    updateBuildingGraphPreview(buildingConfigGraphData, buildingCanvas);

    for (let i = 0; i < results?.length; i++) {
        const r = results[i];
        const label = r.algorithm.title;

        const x = [0];
        const y = [0];
        for (let j = 0; j < r.data.length; j++) {
            const d = r.data[j];

            x.push(d.gameState.simulationTime);
            y.push(d.decision.cpsBefore);
            x.push(d.gameState.simulationTime);
            y.push(d.decision.cpsAfter);
        }

        cpsChart.add(label, x, y);
    }

    for (let i = 0; i < results?.length; i++) {
        const r = results[i];
        const label = r.algorithm.title;

        const x = [0];
        const y = [0];
        for (let j = 1; j < r.data.length; j++) {
            const data = r.data[j];
            const dataBefore = r.data[j - 1];
            const isLast = j === r.data.length - 1;
            const isPurchase =
                Object.keys(data.decision).findIndex(
                    (k) => k === "purchaseable",
                ) !== -1;

            x.push(
                isPurchase
                    ? data.gameState.simulationTime
                    : dataBefore.gameState.simulationTime,
            );
            y.push(data.decision.cookiesBefore);
            x.push(data.gameState.simulationTime);
            y.push(data.decision.cookiesAfter);
        }

        cookieChart.add(label, x, y);
    }

    if (selectedCanvas == null) selectedCanvas = cpsCanvas;
    cpsChart.draw();
    cookieChart.draw();
    chartContext.drawImage(selectedCanvas, 0, 0);

    // Open Timeline
    const openBtns = document.querySelectorAll(".result-data td > div > a");
    for (let i = 0; i < openBtns.length; i++) {
        openBtns[i].addEventListener("click", () => {
            channel.onmessage = (event) => {
                console.log("Data received:", event.data);
                const type = event.data.type;
                const payload = event.data.payload;

                switch (type) {
                    case "RESULT_DATA_REQ":
                        channel.postMessage({
                            type: "RESULT_DATA_RES",
                            payload: results,
                        });
                        break;
                }
            };

            const url = new URL(
                "/src/timeline/timeline.html",
                window.location.origin,
            );
            url.searchParams.set("algorithm", i);
            url.searchParams.set("decision", 0);
            window.open(url, "newwindow", "width=800,height=600");
        });
    }

    if (selectedCanvas == null) selectedCanvas = cpsCanvas;

    // Update line charts
    cpsChart.draw();
    cookieChart.draw();
    chartContext.drawImage(selectedCanvas, 0, 0);

    // Update building graph in main chart if it is selected
    if (selectedCanvas === buildingCanvas) {
        mainChart = new Chart(chartCanvas, {
            ...latestBuildingGraphConfig,
        });
        chartCanvas.style.removeProperty("display");
    }
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
        [
            "BuyCheapest",
            "ShortestPaybackPlusSaveUp",
            "ShortestPaybackAfterPurchase",
        ].findIndex((i) => i === algorithm.name) !== -1;
    greedyAlgorithmsContainer.innerHTML += `
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
    const baseCpS = clicksPerSecondInput.valueAsNumber;

    const results = [];
    for (const algorithm of Algorithm.derived) {
        const active =
            document.querySelector(`#${algorithm.name}:checked`) !== null;

        if (!active) continue;

        // Check whether Brute force segmented is selected
        let isBruteForce = false;
        if (algorithm.name === `BruteForceSegmented`) {
            isBruteForce = true;
        }

        const beforeTime = Date.now();
        // Start the algorithm run, passing the objective in.

        const data = await algorithm.instance.run(
            objective,
            baseCpS,
            isBruteForce,
        );
        const benchmarkTime = Date.now() - beforeTime;

        results.push({
            algorithm: algorithm,
            benchmarkTime: benchmarkTime,
            data: data,
        });
    }

    displayResults(results, objective);

    runBtn.textContent = runBtnText;
    runBtn.removeAttribute("disabled");
    benchmarkResults.classList.remove("hide");

    isRunning = false;
});

form.addEventListener("reset", () => {
    show("Reset", "The form has been reset...");

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
document.querySelectorAll(".previews > canvas").forEach((canvas) => {
    canvas.addEventListener("click", () => {
        // If a mainChart exists, destroy it
        if (mainChart) {
            mainChart.destroy();
            mainChart = null;
        }

        chartContext.clearRect(0, 0, chartCanvas.width, chartCanvas.height);

        // If the canvas is the building-graph, then draw chart
        if (canvas.id === "building-graph") {
            // Update buildingGraphSelected
            isBuildingGraphSelected = true;

            mainChart = new Chart(chartCanvas, {
                ...latestBuildingGraphConfig,
            });

            // Remove unwanted display property generated by chart.js library
            chartCanvas.style.removeProperty("display");

            selectedCanvas = canvas;
            return;
        }

        // Update buildingGraphSelected
        isBuildingGraphSelected = false;

        // Else draw image
        chartContext.drawImage(canvas, 0, 0);
        selectedCanvas = canvas;
    });
});

// Zoom in on chart
chartCanvas.addEventListener("click", () => {
    // Only add zoomed chart, if it is not alreade being displayed
    if (isZoomedChartDisplayed) return;

    /** @type {HTMLCanvasElement} */
    let zoomedChart = null;

    // Update zoomed chart display status
    isZoomedChartDisplayed = true;

    // Special handling for the buildingGraph bar chart
    if (isBuildingGraphSelected) {
        // Create a new empty canvas element
        zoomedChart = document.createElement("canvas");

        // And input a new building graph
        new Chart(zoomedChart, {
            ...latestBuildingGraphConfig,
        });
    }
    // Default: Clone zoomed chart from mainChart
    else {
        zoomedChart = chartCanvas.cloneNode();
        zoomedChart.removeAttribute("id");
    }

    zoomedChart.getContext("2d").drawImage(chartCanvas, 0, 0);

    // Display the zoomed graph
    document.body.appendChild(zoomedChart);

    zoomedChart.classList.add("zoomed");

    // Add event listener to remove zoomed chart
    zoomedChart.addEventListener("click", () => {
        // Remove zoomed chart
        zoomedChart.remove();

        // Update zoomed chart display status
        isZoomedChartDisplayed = false;
    });
});

form.addEventListener("change", updateForm);
updateForm();
