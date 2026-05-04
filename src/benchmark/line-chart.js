import { remap, round } from "../utils.js";
import * as numberformat from "https://esm.sh/swarm-numberformat";

export class LineChartData {
    label = "";
    x = [];
    y = [];

    /**
     * @param {number[]} x
     * @param {number[]} y
     */
    constructor(label, x, y) {
        this.label = label;
        this.x = x;
        this.y = y;
    }
}

export default class LineChart {
    /** @type {HTMLCanvasElement} */
    #canvas = null;
    #title = "";
    #data = [];
    #xLabel = "";
    #yLabel = "";
    /** @type {number | null} */
    #yGoal = null;

    #margin = { t: 156, b: 256, l: 256, r: 128 };
    #bounds = null;
    get bounds() {
        if (this.#bounds === null) {
            const xs = this.#data.flatMap((d) => d.x);
            const ys = this.#data.flatMap((d) => d.y);
            const xMin = Math.min(...xs);
            const xMax = Math.max(...xs);
            const yMin = Math.min(...ys);
            const yMax = Math.max(...ys);

            this.#bounds = {
                xMin: xMin,
                xMax: xMax,
                yMin: yMin,
                yMax: yMax,
            };
        }

        return this.#bounds;
    }

    #getCanvasCoords(dx, dy) {
        const width = this.#canvas.width;
        const height = this.#canvas.height;

        const wPct =
            (dx - this.bounds.xMin) / (this.bounds.xMax - this.bounds.xMin);
        const hPct =
            (dy - this.bounds.yMin) / (this.bounds.yMax - this.bounds.yMin);
        const x =
            (width - this.#margin.l - this.#margin.r) * wPct + this.#margin.l;
        const y =
            height -
            this.#margin.b -
            (height - this.#margin.t - this.#margin.b) * hPct;
        return { x, y };
    }

    /**
     * @param {HTMLCanvasElement} canvas
     * @param {string} xLabel
     * @param {string} yLabel
     */
    constructor(canvas, title, xLabel, yLabel, yGoal, previewForCanvas = null) {
        if (canvas === null) return;
        this.#canvas = canvas;
        this.#title = title;
        this.#xLabel = xLabel;
        this.#yLabel = yLabel;
        this.#yGoal = yGoal;

        if (previewForCanvas !== null) {
            canvas.addEventListener("click", () => this.copy(previewForCanvas));
            return;
        }

        canvas.onclick = () => {
            const zoomed = document.querySelector(".zoomed");
            this.copy(zoomed);

            const span = document.querySelector(".chart-data");
            if (span === null) return;
            span.style.display = "none";
        };

        canvas.onmousemove = (e) => {
            const rect = canvas.getBoundingClientRect();
            const mouse = {
                x: (e.clientX - rect.left) * (canvas.width / rect.width),
                y: (e.clientY - rect.top) * (canvas.height / rect.height),
            };

            const ctx = canvas.getContext("2d");

            let closestData = null;
            if (this.#data.length <= 0) return;

            let minSqrDistance = Infinity;
            for (let i = 0; i < this.#data.length; i++) {
                const d = this.#data[i];
                for (let j = 0; j < d.x.length; j++) {
                    const dx = d.x[j];
                    const dy = d.y[j];

                    const { x: px, y: py } = this.#getCanvasCoords(dx, dy);

                    const sqrDist = (px - mouse.x) ** 2 + (py - mouse.y) ** 2;
                    if (sqrDist > minSqrDistance) continue;

                    minSqrDistance = sqrDist;
                    closestData = {
                        label: d.label,
                        dataX: dx,
                        dataY: dy,
                        canvasX: px,
                        canvasY: py,
                    };
                }
            }

            let span = document.querySelector(".chart-data");
            if (span === null) {
                span = document.createElement("span");
                span.classList.add("chart-data");
                document.body.appendChild(span);
            }

            const tooBigDistance = 64;
            const isDistanceTooBig =
                minSqrDistance > tooBigDistance * tooBigDistance;
            if (isDistanceTooBig) {
                span.style.display = "none";
                return;
            }

            span.innerHTML = `
                <h2>${closestData.label}</h2>
                x: ${round(closestData.dataX, 1)}<br>
                y: ${round(closestData.dataY, 1)}
            `;
            span.style.display = "block";
            span.style.left = e.clientX + "px";
            span.style.top = e.clientY + "px";
        };

        canvas.onmouseleave = () => {
            const span = document.querySelector(".chart-data");
            if (span === null) return;
            span.style.display = "none";
        };
    }

    copy(toCanvas) {
        const toLineChart = new LineChart(
            toCanvas,
            this.#title,
            this.#xLabel,
            this.#yLabel,
            this.#yGoal,
        );
        for (const d of this.#data) toLineChart.add(d.label, d.x, d.y);
        toLineChart.draw();
    }

    /**
     * @param {string} label
     * @param {number[]} x
     * @param {number[]} y
     */
    add(label, x, y) {
        if (label == null) label = "";
        if (x == null) x = [];
        if (y == null) y = [];

        const dataObj = new LineChartData(label, x, y);
        this.#data.push(dataObj);
    }

    draw(canvas = this.#canvas) {
        if (canvas == null) return;
        if (this.#data.length === 0) return;

        const ctx = canvas.getContext("2d");

        const graphColors = [
            "#1447e6",
            "#00bc7d",
            "#fe9a00",
            "#ad46ff",
            "#ff2056",
        ];

        const height = ctx.canvas.height;
        const width = ctx.canvas.width;
        const xLength = Math.max(...this.#data.flatMap((d) => d.x.length));
        const yLength = Math.max(...this.#data.flatMap((d) => d.y.length));

        const clear = () => {
            const color = getComputedStyle(canvas)
                .getPropertyValue("--accent")
                .trim();
            ctx.fillStyle = color;
            ctx.fillRect(0, 0, width, height);
        };

        const drawTitle = () => {
            ctx.textBaseline = "top";
            ctx.fillStyle = "white";
            ctx.font = "bold 64px sans-serif";

            const measure = ctx.measureText(this.#title);
            const x = width * 0.5 - measure.actualBoundingBoxRight * 0.5;
            const y =
                this.#margin.t * 0.5 - measure.actualBoundingBoxDescent * 0.5;
            ctx.fillText(this.#title, x, y);
        };

        const drawGrid = () => {
            ctx.beginPath();

            const xCount = Math.min(xLength, 10);
            const yCount = Math.min(yLength, 10);

            for (let i = 0; i < xCount; i++) {
                const pct = i / (xCount - 1);
                const y =
                    (height - this.#margin.t - this.#margin.b) * pct +
                    this.#margin.t;

                // Horizontal Line
                ctx.moveTo(this.#margin.l, y);
                ctx.lineTo(width - this.#margin.r, y);
            }

            for (let i = 0; i < yCount; i++) {
                const pct = i / (yCount - 1);
                const x =
                    (width - this.#margin.l - this.#margin.r) * pct +
                    this.#margin.l;

                // Vertical Line
                ctx.moveTo(x, this.#margin.t);
                ctx.lineTo(x, height - this.#margin.b);
            }

            const color = getComputedStyle(canvas)
                .getPropertyValue("--border")
                .trim();
            ctx.strokeStyle = color;
            ctx.lineWidth = 2;
            ctx.stroke();
        };

        const drawXAxis = () => {
            const count = Math.min(xLength, 10);

            for (let i = 0; i < count; i++) {
                const pct = i / (count - 1);

                const value = remap(
                    pct,
                    0,
                    1,
                    this.bounds.xMin,
                    this.bounds.xMax,
                );
                const valueText =
                    value >= 1000
                        ? numberformat.formatShort(value)
                        : round(value, 0);
                const measure = ctx.measureText(valueText);

                const x =
                    remap(pct, 0, 1, this.#margin.l, width - this.#margin.r) -
                    measure.actualBoundingBoxRight * 0.5;
                const y = height - this.#margin.b;
                ctx.fillText(valueText, x, y);
            }
        };

        const drawYAxis = () => {
            const count = Math.min(yLength, 10);

            for (let i = 0; i < count; i++) {
                const pct = i / (count - 1);

                const value = remap(
                    pct,
                    0,
                    1,
                    this.bounds.yMax,
                    this.bounds.yMin,
                );
                const valueText =
                    value >= 1000
                        ? numberformat.formatShort(value)
                        : round(value, 0);
                const measure = ctx.measureText(valueText);

                const x = this.#margin.l - measure.actualBoundingBoxRight - 12;
                const y =
                    remap(pct, 0, 1, this.#margin.t, height - this.#margin.b) -
                    measure.actualBoundingBoxDescent * 0.5;
                ctx.fillText(valueText, x, y);
            }
        };

        const drawAxes = () => {
            ctx.font = "42px sans-serif";

            drawXAxis();
            drawYAxis();
        };

        const drawLabels = () => {
            ctx.font = "42px sans-serif";
            ctx.textAlign = "center";

            // x-label
            ctx.fillText(this.#xLabel, width / 2, height - this.#margin.b + 64);

            // y-label
            ctx.save();

            const yMeasure = ctx.measureText(this.#yLabel);
            ctx.translate(24, height / 2);
            ctx.rotate(-Math.PI / 2);
            ctx.fillText(this.#yLabel, 0, 0);

            ctx.restore();

            // algorithm labels
            ctx.font = "42px sans-serif";
            ctx.textAlign = "left";
            const gap = 36;
            const labelsWidth =
                this.#data
                    .flatMap(
                        (d) =>
                            ctx.measureText(
                                d.label.replace(/\[.*?\]/g, "").trim(),
                            ).actualBoundingBoxRight,
                    )
                    .reduce((sum, m) => sum + m) +
                2.5 * gap * (this.#data.length - 1);
            let labelCurrentOffset = 0;

            for (let i = 0; i < this.#data.length; i++) {
                const d = this.#data[i];
                const label = d.label.replace(/\[.*?\]/g, "").trim();
                const measure = ctx.measureText(label);
                const x = width / 2 - labelsWidth / 2 + labelCurrentOffset;
                const y = height - measure.actualBoundingBoxDescent - 24;

                ctx.fillStyle = graphColors[i];
                ctx.fillRect(
                    x,
                    y,
                    measure.actualBoundingBoxDescent,
                    measure.actualBoundingBoxDescent,
                );
                ctx.fillStyle = "white";
                ctx.fillText(label, x + 1.5 * gap, y);
                labelCurrentOffset +=
                    measure.actualBoundingBoxRight + 2.5 * gap;
            }
        };

        const drawDataLines = () => {
            const dataSetCount = this.#data.length;
            ctx.lineWidth = 4;
            ctx.lineCap = "round";
            ctx.lineJoin = "round";

            for (let i = 0; i < dataSetCount; i++) {
                const d = this.#data[i];
                const points = [];

                for (let j = 0; j < d.x.length; j++) {
                    const dy = d.y[j];
                    const dx = d.x[j];

                    const { x, y } = this.#getCanvasCoords(dx, dy);
                    points.push({ x, y });

                    if (j === 0) {
                        ctx.beginPath();
                        ctx.moveTo(x, y);
                        continue;
                    }

                    ctx.lineTo(x, y);
                }

                ctx.strokeStyle = graphColors[i];
                ctx.stroke();

                // Draw circles for this dataset's points
                for (const p of points) {
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, 8, 0, 2 * Math.PI);
                    ctx.fillStyle =
                        getComputedStyle(canvas)
                            .getPropertyValue("--accent")
                            .trim() || "black";
                    ctx.fill();
                    ctx.stroke();
                }
            }
        };

        const drawGoals = () => {
            if (!this.#yGoal) return;

            ctx.beginPath();

            const hPct =
                (this.#yGoal - this.bounds.yMin) /
                (this.bounds.yMax - this.bounds.yMin);
            const y =
                height -
                this.#margin.b -
                (height - this.#margin.t - this.#margin.b) * hPct;

            ctx.moveTo(this.#margin.l, y);
            ctx.lineTo(width - this.#margin.r, y);

            ctx.strokeStyle = "#ff2056";
            ctx.lineCap = "butt";
            ctx.setLineDash([25, 25]);
            ctx.stroke();
            ctx.setLineDash([]);
        };

        const drawGraph = () => {
            clear();

            drawGrid();
            drawDataLines();
            drawGoals();
            drawTitle();
            drawAxes();
            drawLabels();
        };

        drawGraph();
    }
}
