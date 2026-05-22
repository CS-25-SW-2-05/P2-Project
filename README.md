# Cookie Clicker Benchmarking Tool
A browser-based tool for benchmarking and comparing algorithmic strategies on a simplified model of Cookie Clicker. Developed as a 2nd semester project at Aalborg University (Software, CS-26-SW-2-05).

## About
The program models Cookie Clicker as a sequential decision problem and lets the user benchmark different algorithms against each other under identical conditions. It records performance metrics for each run and visualises the results through charts, a comparison table, and a decision-by-decision timeline.

## Features

- Run one or more algorithms sequentially on the same initial game state
- Configurable simulation environment (clicks per second, number of buildings, brute force horizon)
- Four objective types: minimise time to a target cookie count or production rate, or maximise either by a target time
- Side-by-side metric comparison with best/worst colour coding
- Production-over-time and cookies-over-time line charts
- Final building configuration bar chart
- Per-algorithm decision timeline in a separate window
- Stop button for terminating long-running benchmarks
- Built-in unit test page

## Implemented Algorithms

- **[Greedy] Buy Cheapest** — purchases the cheapest available building
- **[Greedy] Shortest Payback (After Purchase)** — purchases the building with the shortest payback period
- **[Greedy] Shortest Payback (+Save-up)** — payback including save-up time
- **[Brute Force] Segmented** — segmented brute-force search with configurable horizon

## Running the project

The project is a static client-side application. No build step or backend is required.

```bash
# Clone the repo
git clone <repo-url>
cd <repo-name>

# Serve the files with any static server, e.g.
python3 -m http.server 8000
# Or `Live Server` VS Code extension

```

Then open `http://localhost:8000/src/index.html` in a Chromium-based browser for best compatibility

> **Note:** Memory measurement uses the `performance.memory` API, which is only available in Chromium-based browsers. The rest of the tool works in any modern browser.

## Project Structure

src/
├── index.html                  # Main UI
├── style.css
├── script.js                   # Entry point and benchmark coordinator
├── utils.js
├── README.md
├── algorithms/
│   ├── algorithm.js            # Base class and algorithm runner
│   ├── greedy-naive.js
│   ├── greedy-payback.js
│   ├── greedy-payback-time.js
│   ├── brute-force-segmented.js
│   ├── objective.js
│   └── decisions/
│       ├── decision.js
│       ├── purchase-decision.js
│       └── wait-decision.js
├── cookie-clicker/
│   ├── game-state.js
│   ├── buildings.json
│   └── purchasables/
│       ├── purchasable.js
│       └── building.js
├── benchmark/
│   ├── line-chart.js
│   └── building-chart.js
|── images/
|   |── collapse.svg
|   |── cookie.png
|   |── expand.svg
|   |── info.svg
|   |── open-in-new.svg
|   |── run.svg
|   └── wait.svg
├── timeline/                   # Decision timeline window
|   ├── timeline.html
|   └── timeline.js
└── tests/                      # Unit tests
    |── tests.html
    |── tests.js
    └── unit-test/
        |── buy-cheapest-test.js
        |── payback.js
        |── smart-payback-test.js
        |── permutations-test.js
        |── getSegmentSolution.js
        |── getMemoryStatus.js
        |── getBruteForceSegmentedSolution.js
        |── filter-building-test.js
        └── unit-test.js



## Adding a New Algorithm

1. Create a new file under `src/algorithms/`.
2. Extend the `Algorithm` base class and implement `getNextDecision(gameState, objective, buildings, signal)`.
3. Register the algorithm by adding it to `Algorithm.derived` in a `static dummy` field (see existing algorithms for the pattern).
4. Import the file in `script.js` for its side effects.

The algorithm will appear automatically in the UI on the next page load.

## Authors

CS-26-SW-2-05, Aalborg University, Spring 2026

- Ahmad T. Zirman
- Frederik B. Jørgensen
- Lauritz T. Blohm
- Martin B. Andersen
- Matushan Mathialakan
