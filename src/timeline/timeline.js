import { round } from "../utils.js";
import {
    gameStateToDataset,
    getBuildingGraphData,
    getBuildingGraphConfig,
    updateBuildingGraphPreview,
    createBuildingChartCanvas,
} from "../benchmark/building-chart.js";
import Chart from "https://esm.sh/chart.js/auto";

const params = new URLSearchParams(window.location.search);
const algorithmIndex = parseInt(params.get("algorithm")) || 0;
let decisionIndex = parseInt(params.get("decision")) || 0;
const buildingGraph = document.querySelector("#building-graph");

const titleHeader = document.querySelector("h1");
const decisionHeader = document.querySelector("#decision-title");
const indexText = document.querySelector("#index");

const decisionTable = document.querySelector("#decision-data");

/** @type {HTMLButtonElement} */
const prevBtn = document.querySelector("#prev");
/** @type {HTMLButtonElement} */
const nextBtn = document.querySelector("#next");
/** @type {HTMLInputElement} */
const indexSlider = document.querySelector("#decision-index");

const result = await requestResult();
indexSlider.max = result.data.length - 1;
console.log(result);

function requestResult() {
    return new Promise((resolve) => {
        const channel = new BroadcastChannel("cookie_timeline");

        channel.onmessage = (event) => {
            const type = event.data.type;
            const payload = event.data.payload;

            switch (type) {
                case "RESULT_DATA_RES":
                    resolve(payload[algorithmIndex]);
                    break;
            }
        };

        channel.postMessage({ type: "RESULT_DATA_REQ" });
    });
}

function display() {
    const algorithm = result.algorithm;
    const decision = result.data[decisionIndex].decision;
    const gameState = result.data[decisionIndex].gameState;

    console.log("Algorithm:", algorithm);
    console.log("Decision:", decision);
    console.log("Game State:", gameState);

    titleHeader.innerText = algorithm.title;

    const isPurchase =
        Object.keys(decision).findIndex((k) => k === "purchaseable") !== -1;

    decisionHeader.innerText = isPurchase ? decision.purchaseable.name : "Wait";
    indexText.innerText = `${decisionIndex + 1} of ${result.data.length}`;

    decisionTable.innerHTML = `
        <tbody>
            <tr>
                <td>Valid</td>
                <td style="text-align: right;">${decision.isValid ? "✅" : "❌"}</td>
            </tr>
            <tr>
                <td>Simulated Time (s)</td>
                <td style="text-align: right;">${round(result.data[decisionIndex].gameState.simulationTime, 1)}</td>
            </tr>
            <tr>
                <td>Wait Time (s)</td>
                <td style="text-align: right;">${round(decision.wait, 1)}</td>
            </tr>
            <tr>
                <td>Cookies Before</td>
                <td style="text-align: right;">${round(decision.cookiesBefore, 1)}</td>
            </tr>
            <tr>
                <td>Cookies After</td>
                <td style="text-align: right;">${round(decision.cookiesAfter, 1)}</td>
            </tr>
            <tr>
                <td>Total Cookies</td>
                <td style="text-align: right;">${round(gameState.totalCookies, 1)}</td>
            </tr>
            <tr>
                <td>CpS Before</td>
                <td style="text-align: right;">${round(decision.cpsBefore, 1)}</td>
            </tr>
            <tr>
                <td>CpS After</td>
                <td style="text-align: right;">${round(decision.cpsAfter, 1)}</td>
            </tr>
        </tbody>
    `;

    buildingGraph.innerHTML = "";
    buildingGraph.appendChild(
        createBuildingChartCanvas(result.data[decisionIndex].gameState),
    );
}

function setDecisionIndex(index, shouldUpdateUrl = true) {
    if (index < 0) return;
    if (index > result.data.length - 1) return;

    indexSlider.value = index;
    decisionIndex = index;

    display();

    if (!shouldUpdateUrl) return;
    const newURL = new URL(window.location);
    newURL.searchParams.set("decision", index);
    window.history.pushState({}, "", newURL);
}

prevBtn.addEventListener("click", () => {
    setDecisionIndex(decisionIndex - 1);
});

nextBtn.addEventListener("click", () => {
    setDecisionIndex(decisionIndex + 1);
});

indexSlider.addEventListener("input", () => {
    const index = indexSlider.valueAsNumber;
    setDecisionIndex(index, false);
});

indexSlider.addEventListener("change", () => {
    const index = indexSlider.valueAsNumber;
    setDecisionIndex(index);
});

setDecisionIndex(decisionIndex);
display();
