import {
	buildings,
	loadBuildings,
} from "./cookie-clicker/purchasables/building.js";
import GreedyNaive from "./algorithms/greedy-naive.js";
import game from "./cookie-clicker/game.js";

const algorithmSelect = document.getElementById("algorithm-select");
const algorithmCount = document.getElementById("algorithm-count");
const bruteForceConditions = document.getElementById("brute-force-conditions");

function updateForm() {
	const runBtn = form.querySelector("button[type='submit']");
	const count = getActiveAlgorithms();
	if (count <= 0) runBtn.setAttribute("disabled", "disabled");
	else runBtn.removeAttribute("disabled");
	updateAlgorithmSection();
}

function updateAlgorithmSection() {
	// Update count
	const count = getActiveAlgorithms();
	const algorithmCountText = `${count} algorithm${count === 1 ? "" : "s"} selected`;
	algorithmCount.textContent = algorithmCountText;

	// Update brute force conditions
	const selectionArray = [...algorithmSelect.selectedOptions];
	bruteForceConditions.classList.toggle(
		"show",
		selectionArray.some((o) => o.value === "brute-force"),
	);
}

function getActiveAlgorithms() {
	const count = algorithmSelect.selectedOptions.length;
	return count;
}

function show(title, msg) {
	const toast = document.querySelector(".toast");
	const toastTitle = toast.querySelector("h2");
	const toastMsg = toast.querySelector("p");

	toastTitle.textContent = title;
	toastMsg.textContent = msg;
	toast.classList.add("show");
	setTimeout(() => toast.classList.remove("show"), 4000);
}

await loadBuildings();
console.log(buildings);

const form = document.querySelector("form");
form.addEventListener("submit", async (e) => {
	e.preventDefault();

	const runBtn = form.querySelector("button[type='submit']");
	console.log("Running Benchmark...");

	game.reset();

	runBtn.setAttribute("disabled", "disabled");
	const runBtnText = runBtn.textContent;
	runBtn.textContent = "Running...";

	const naive = new GreedyNaive();
	await naive.run();

	runBtn.textContent = runBtnText;
	runBtn.removeAttribute("disabled");
});

form.addEventListener("reset", () => {
	// Timeout to push the execution to after values has been reset
	setTimeout(() => {
		show("Reset", "The form has been reset...");
		updateForm();
	}, 0);
});

form.addEventListener("change", updateForm);

updateForm();
