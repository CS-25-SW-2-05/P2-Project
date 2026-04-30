import { loadBuildings } from "./cookie-clicker/purchasables/building.js";
import Algorithm from "./algorithms/algorithm.js";
import Objective from "./algorithms/objective.js";
import {
    getPlural,
    round,
    formatLabel,
    formatTime,
    safeDivide,
} from "./utils.js";
import "./algorithms/greedy-naive.js";
import "./algorithms/greedy-payback.js";
import "./algorithms/greedy-payback-time.js";
import "./algorithms/brute-force-segmented.js";
import Decision from "./algorithms/decisions/decision.js";
import GameState from "./cookie-clicker/game-state.js";
import * as numberformat from "https://esm.sh/swarm-numberformat";
import LineChart from "./benchmark/line-chart.js";
import {
    gameStateToDataset,
    getBuildingGraphData,
    getBuildingGraphConfig,
    updateBuildingGraphPreview,
    createBuildingChartCanvas,
} from "./benchmark/building-chart.js";
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
/** @type {HTMLButtonElement} */
const stopBtn = document.querySelector("#stop-btn");

const channel = new BroadcastChannel("cookie_timeline");
const toast = document.querySelector(".toast");
const toastTitle = toast.querySelector("h2");
const toastMsg = toast.querySelector("p");
const resultSection = document.querySelector(".results-section");
const expandButton = document.querySelector(".expand-button");
const inputForm = document.querySelector(".input-form");

let isRunning = false;
let stopRequested = false;
let selectedCanvas = null;

let mainChart = null;
let latestBuildingGraphConfig = null;
let buildingGraphIsSelected = false;
let isZoomedChartDisplayed = false;
let resultSectionIsExpanded = false;

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

function getStatColor(value, bestValue, worstValue) {
    if (value === bestValue) return "rgb(150, 255, 150)";
    if (value === worstValue) return "rgb(255, 150, 150)";
    return "white";
}

function formatFactorDifference(factor, sign) {
    if (factor <= 1) return "";

    return "(" + sign + round(factor - 1, 2) + "x)";
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

    // Set variables for best values

    let lowestIterations = Infinity;
    let lowestIterationTime = Infinity;
    let lowestBenchmarkTime = Infinity;
    let lowestSimulationTime = Infinity;
    let highestCPS = 0;
    let highestCookies = 0;
    let highestTotalCookies = 0;

    // Set variables for worst values

    let highestIterations = 0;
    let highestIterationTime = 0;
    let highestBenchmarkTime = 0;
    let highestSimulationTime = 0;
    let lowestCPS = Infinity;
    let lowestCookies = Infinity;
    let lowestTotalCookies = Infinity;

    for (const r of results || []) {
        const lastData = r.data.at(-1);

        const iterationTime = safeDivide(
            r.benchmarkTime * 1000,
            r.data.length,
            0,
        );

        // Update lowest values:
        // Number of iterations
        if (r.data.length < lowestIterations) lowestIterations = r.data.length;
        // Iteration time
        if (iterationTime < lowestIterationTime)
            lowestIterationTime = iterationTime;
        // Benchmark time
        if (r.benchmarkTime < lowestBenchmarkTime)
            lowestBenchmarkTime = r.benchmarkTime;
        // Simulation time
        if (lastData.gameState.simulationTime < lowestSimulationTime)
            lowestSimulationTime = lastData.gameState.simulationTime;

        // Update highest values:
        // CPS
        if (lastData.gameState.buildingCpS > highestCPS)
            highestCPS = lastData.gameState.buildingCpS;
        // Cookies
        if (lastData.gameState.cookies > highestCookies)
            highestCookies = lastData.gameState.cookies;
        // Total cookies
        if (lastData.gameState.totalCookies > highestTotalCookies)
            highestTotalCookies = lastData.gameState.totalCookies;

        // Update worst values:
        // Number of iterations
        if (r.data.length > highestIterations)
            highestIterations = r.data.length;
        // Iteration time
        if (iterationTime > highestIterationTime)
            highestIterationTime = iterationTime;
        // Benchmark time
        if (r.benchmarkTime > highestBenchmarkTime)
            highestBenchmarkTime = r.benchmarkTime;
        // Simulation time
        if (lastData.gameState.simulationTime > highestSimulationTime)
            highestSimulationTime = lastData.gameState.simulationTime;
        // CPS
        if (lastData.gameState.buildingCpS < lowestCPS)
            lowestCPS = lastData.gameState.buildingCpS;
        // Cookies
        if (lastData.gameState.cookies < lowestCookies)
            lowestCookies = lastData.gameState.cookies;
        // Total cookies
        if (lastData.gameState.totalCookies < lowestTotalCookies)
            lowestTotalCookies = lastData.gameState.totalCookies;
    }

    // Table Results
    const tbody = document.querySelector(".result-data > tbody");
    tbody.innerHTML = "";
    for (const r of results || []) {
        const lastData = r.data.at(-1);

        const iterationTime = (r.benchmarkTime * 1000) / r.data.length;

        // Calculate factor difference from lowest:
        // Number of iterations
        const iterationsFactor = safeDivide(r.data.length, lowestIterations);

        // Iteration time
        const iterationTimeFactor = safeDivide(
            iterationTime,
            lowestIterationTime,
        );

        // Benchmark time
        const benchmarkTimeFactor = safeDivide(
            r.benchmarkTime,
            lowestBenchmarkTime,
        );

        // Simulation time
        const simulationTimeFactor = safeDivide(
            lastData.gameState.simulationTime,
            lowestSimulationTime,
        );

        // From highest:
        // Building CPS
        const cpsFactor = safeDivide(
            highestCPS,
            lastData.gameState.buildingCpS,
        );

        // Cookies
        const cookiesFactor = safeDivide(
            highestCookies,
            lastData.gameState.cookies,
        );

        // Total cookies
        const totalCookiesFactor = safeDivide(
            highestTotalCookies,
            lastData.gameState.totalCookies,
        );

        tbody.innerHTML += `
            <tr>
                <td>
                    <div>
                        <a>
                            <img src="./images/open_in_new.svg" alt="Open in New" />
                        </a>
                        ${r.algorithm.title.replace("[Greedy]", "")}
                    </div>
                </td>
                
                <td style="color: ${getStatColor(lastData.gameState.simulationTime, lowestSimulationTime, highestSimulationTime)};">
                ${formatTime(lastData.gameState.simulationTime, "s")} 
                ${formatFactorDifference(simulationTimeFactor, "+")}</td>

                <td style="color: ${getStatColor(r.benchmarkTime, lowestBenchmarkTime, highestBenchmarkTime)};">
                ${formatTime(round(r.benchmarkTime, 0), "ms")} 
                ${formatFactorDifference(benchmarkTimeFactor, "+")}</td>

                <td style="color: ${getStatColor(r.data.length, lowestIterations, highestIterations)};">
                ${numberformat.format(r.data.length)} 
                ${formatFactorDifference(iterationsFactor, "+")}</td>
    
                <td style="color: ${getStatColor(iterationTime, lowestIterationTime, highestIterationTime)};">
                ${formatTime(iterationTime, "us")} 
                ${formatFactorDifference(iterationTimeFactor, "+")}</td>
    
                <td style="color: ${getStatColor(lastData.gameState.buildingCpS, highestCPS, lowestCPS)};">
                ${numberformat.format(lastData.gameState.buildingCpS)} 
                ${formatFactorDifference(cpsFactor, "-")}</td>
    
                <td style="color: ${getStatColor(lastData.gameState.cookies, highestCookies, lowestCookies)};">
                ${numberformat.format(lastData.gameState.cookies)} 
                ${formatFactorDifference(cookiesFactor, "-")}</td>
    
                <td style="color: ${getStatColor(lastData.gameState.totalCookies, highestTotalCookies, lowestTotalCookies)};">
                ${numberformat.format(lastData.gameState.totalCookies)} 
                ${formatFactorDifference(totalCookiesFactor, "-")}</td>
    
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
        for (let j = 0; j < r.data.length; j++) {
            const data = r.data[j];
            const dataBefore = r.data[j - 1] ?? {
                gameState: {
                    simulationTime: 0,
                },
            };
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
			<label for="${algorithm.name}">
                ${algorithm.title}
                <a tooltip="${algorithm.tooltip}">
                    <img src="./images/info.svg" alt="Info" />
                </a>
				<input type="checkbox" class="hide" id="${algorithm.name}" name="${algorithm.name}" ${activeByDefault ? "checked" : ""} />
            </label>
		</div>
	`;
}

const tooltip = document.querySelector("#tooltip");
const tooltips = document.querySelectorAll("[tooltip]");
for (const tt of tooltips) {
    tt.addEventListener("mousemove", (e) => {
        const text = tt.getAttribute("tooltip");
        tooltip.innerText = text;
        tooltip.style.left = e.clientX + 8 + "px";
        tooltip.style.top = e.clientY + 16 + "px";
        tooltip.style.display = "block";
    });

    tt.addEventListener("mouseleave", () => {
        tooltip.style.display = "none";
    });
}

console.log("Algorithms", Algorithm.derived);

// Subscribe to events
stopBtn.addEventListener("click", () => {
    if (!isRunning) return;
    stopRequested = true;
    stopBtn.setAttribute("disabled", "disabled");
    stopBtn.textContent = "Stopping...";
    show("Stopping", "Benchmark will halt after the current step...");
});

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    isRunning = true;
    stopRequested = false;

    // Read the form and create an Objective instance right when the user clicks "Run"
    const objective = Objective.fromForm();

    const runBtn = form.querySelector("button[type='submit']");
    console.log("Running Benchmark...");

    runBtn.setAttribute("disabled", "disabled");
    const runBtnText = runBtn.textContent;
    runBtn.textContent = "Running...";

    stopBtn.textContent = "Stop";
    stopBtn.removeAttribute("disabled");

    const buildingLength = buildingLengthInput.valueAsNumber;
    await loadBuildings(buildingLength);
    const baseCpS = clicksPerSecondInput.valueAsNumber;

    const shouldStop = () => stopRequested;
    const results = [];
    try {
        for (const algorithm of Algorithm.derived) {
            if (stopRequested) break;

            const active =
                document.querySelector(`#${algorithm.name}:checked`) !== null;

            if (!active) continue;

            // Check whether Brute force segmented is selected
            let isBruteForce = false;
            if (algorithm.name === `BruteForceSegmented`) {
                isBruteForce = true;
            }

            // Abort if the algorithm is bruteforce and the objective is
            // fixed horizon (not supported)
            if (
                (isBruteForce && objective.type === "fixed-time-cookies") ||
                (isBruteForce && objective.type === "fixed-time-production")
            ) {
                // Remove algorithm selection
                document.getElementById("BruteForceSegmented").checked = false;
                continue;
            }

            const beforeTime = Date.now();
            // Start the algorithm run, passing the objective in.

            const data = await algorithm.instance.run(
                objective,
                baseCpS,
                isBruteForce,
                shouldStop,
            );
            const benchmarkTime = Date.now() - beforeTime;

            if (data && data.length > 0) {
                results.push({
                    algorithm: algorithm,
                    benchmarkTime: benchmarkTime,
                    data: data,
                });
            }
        }

        if (results.length > 0) {
            displayResults(results, objective);
            benchmarkResults.classList.remove("hide");
        }

        if (stopRequested) {
            show("Stopped", "Benchmark was stopped before completion.");
        }
    } finally {
        runBtn.textContent = runBtnText;
        runBtn.removeAttribute("disabled");

        stopBtn.textContent = "Stop";
        stopBtn.setAttribute("disabled", "disabled");

        isRunning = false;
        stopRequested = false;
    }
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
            buildingGraphIsSelected = true;

            mainChart = new Chart(chartCanvas, {
                ...latestBuildingGraphConfig,
            });

            // Remove unwanted display property generated by chart.js library
            chartCanvas.style.removeProperty("display");

            selectedCanvas = canvas;
            return;
        }

        // Update buildingGraphSelected
        buildingGraphIsSelected = false;

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
    if (buildingGraphIsSelected) {
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
        zoomedChart.getContext("2d").drawImage(chartCanvas, 0, 0);
    }

    // Hide input form and result section when displaying zoomed chart
    inputForm.classList.add("hide");
    resultSection.classList.add("hide");

    // Display the zoomed graph
    document.body.appendChild(zoomedChart);

    zoomedChart.classList.add("zoomed");

    // Add event listener to remove zoomed chart
    zoomedChart.addEventListener("click", () => {
        // Show input form when closing zoomed chart
        inputForm.classList.remove("hide");
        resultSection.classList.remove("hide");

        // Remove zoomed chart
        zoomedChart.remove();

        // Update zoomed chart display status
        isZoomedChartDisplayed = false;
    });
});

// Expand result section
expandButton.addEventListener("click", () => {
    // Toggle wether the section is expanded
    resultSectionIsExpanded = !resultSectionIsExpanded;

    // Mark resultsection class as expanded
    resultSection.classList.toggle("expanded");

    // Hide input form if result section is expanded
    if (resultSectionIsExpanded) inputForm.classList.add("hide");
    // Otherwise, show it
    else inputForm.classList.remove("hide");
});

form.addEventListener("change", updateForm);
updateForm();
