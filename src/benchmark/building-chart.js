import * as numberformat from "https://esm.sh/swarm-numberformat";
import Chart from "https://esm.sh/chart.js/auto";
import { formatLabel } from "../utils.js";

const chartCanvas = document.querySelector("#chart");

/**
 * Converts a GameState to a single Chart.js dataset
 * @param {GameState} gameState
 * @param {string} label
 * @returns {{ labels: string[], data: number[], label: string }}
 */
export function gameStateToDataset(gameState, label) {
    const buildings = gameState.buildings;

    // Make a list of the number owned of each building in the gamestate
    const data = Object.values(buildings).map((building) => building.owned);

    // Construct a list of building name labels
    const labels = Object.keys(buildings).map(formatLabel);

    return {
        labels,
        data,
        label,
    };
}

export function getBuildingGraphData(results) {
    // Creating object to contain data and config for buildingGraph
    const graphData = {
        labels: [],
        datasets: [],
    };

    // Convert benchmark results into Chart.js format by extracting owned buildings
    // from the final game state of each algorithm run
    if (!results) return graphData;

    const graphColors = ["#1447e6", "#00bc7d", "#fe9a00", "#ad46ff", "#ff2056"];

    let i = 0;

    // for each algorithm
    for (const result of results) {
        // Get the algorithm label
        const resultLabel = formatLabel(result.algorithm.name);

        // Get the gamestate from the last decision
        const lastGameState = result.data[result.data.length - 1].gameState;

        // Compile dataset
        const dataset = gameStateToDataset(lastGameState, resultLabel);

        // Set building labels only on the first run
        if (graphData.labels.length === 0) {
            graphData.labels = dataset.labels;
        }

        // Push the dataset for the algorithm
        graphData.datasets.push({
            label: dataset.label,
            data: dataset.data,
            backgroundColor: graphColors[i],
        });
        i++;
    }

    return graphData;
}

// Config for buildingChart
export function getBuildingGraphConfig(buildingConfigGraphData, canvas) {
    return {
        type: "bar",
        data: buildingConfigGraphData,
        options: {
            responsive: true,
            animation: false,
            devicePixelRatio: window.devicePixelRatio,
            onHover: (event, chartElements) => {
                event.native.target.style.cursor =
                    chartElements.length > 0 ? "pointer" : "zoom-in";
            },
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
                    text: "Building Configuration",
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

// Returns a buildingGraph canvas given a gameState
export function createBuildingChartCanvas(gameState) {
    const dataset = gameStateToDataset(gameState, "Buildings");

    const graphData = {
        labels: dataset.labels,
        datasets: [
            {
                label: dataset.label,
                data: dataset.data,
            },
        ],
    };

    const canvas = document.createElement("canvas");

    const config = getBuildingGraphConfig(graphData, canvas);
    config.options.responsive = false;

    new Chart(canvas, config);

    return canvas;
}

// Converts a canvas to an image
export function drawCanvasInPreview(sourceCanvas, previewCanvas) {
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

export function updateBuildingGraphPreview(
    buildingConfigGraphData,
    buildingCanvas,
) {
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
