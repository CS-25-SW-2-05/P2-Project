const params = new URLSearchParams(window.location.search);
const algorithmIndex = parseInt(params.get("algorithm")) || 0;
let decisionIndex = parseInt(params.get("decision")) || 0;

const titleHeader = document.querySelector("h1");
const prevBtn = document.querySelector("#prev");
const nextBtn = document.querySelector("#next");

function display(algorithm, decision) {
	console.log("Algorithm:", algorithm);
	console.log("Decision:", decision);

	titleHeader.innerHTML = algorithm.title;
}

function setDecisionIndex(index) {
	decisionIndex = index;
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

const channel = new BroadcastChannel("cookie_timeline");

channel.onmessage = (event) => {
	console.log(algorithmIndex, decisionIndex, event.data);
	const type = event.data.type;
	const payload = event.data.payload;

	switch (type) {
		case "RESULT_DATA_RES":
			display(
				payload[algorithmIndex].algorithm,
				payload[algorithmIndex].data[decisionIndex],
			);
			break;
	}
};

channel.postMessage({ type: "RESULT_DATA_REQ" });
