import {
	buildings,
	loadBuildings,
} from "./cookie-clicker/purchasables/building.js";
import GreedyNaive from "./algorithms/greedy-naive.js";
import game from "./cookie-clicker/game.js";

console.log("Hello from script.js");

await loadBuildings();
console.log(buildings);

const form = document.querySelector("form");
const runBtn = form.querySelector("button[type='submit']");
form.addEventListener("submit", async (e) => {
	e.preventDefault();
	console.log("Running Benchmark...");

	game.reset();

	runBtn.setAttribute("disabled", "disabled");

	const naive = new GreedyNaive();
	await naive.run();

	runBtn.removeAttribute("disabled");
});
