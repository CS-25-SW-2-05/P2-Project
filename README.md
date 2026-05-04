# P2-Project

A benchmarking tool for comparing algorithms that play [Cookie Clicker](https://orteil.dashnet.org/cookieclicker/).

## What it does

The program simulates Cookie Clicker and runs different algorithms that decide **when to buy buildings** and **when to wait** in order to reach a goal as fast as possible. You pick the algorithms, the settings, and an objective — then the tool runs each algorithm against the same simulation and shows the results.

## Algorithms

- **Greedy Naive** — always buys the cheapest available building.
- **Greedy Payback** — buys the building with the best payback (cost ÷ production gain).
- **Greedy Payback Time** — like Payback, but factors in the time spent waiting for the cookies.
- **Brute Force (Segmented)** — explores all purchase sequences within a limited horizon.

## Objectives

- Reach a target number of cookies.
- Reach a target production rate (cookies per second).
- Maximize cookies or production within a fixed time.

## Running it

Open [src/index.html](src/index.html) in a browser. Pick algorithms, configure the settings, and click **Run Benchmark**.

Unit tests are available at [src/tests/tests.html](src/tests/tests.html).
