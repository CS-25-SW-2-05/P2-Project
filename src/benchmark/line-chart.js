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
    #data = [];
    #xLabel = "";
    #yLabel = "";
    /** @type {number | null} */
    #yGoal = null;

    /**
     * @param {HTMLCanvasElement} canvas
     * @param {string} xLabel
     * @param {string} yLabel
     */
    constructor(canvas, xLabel, yLabel, yGoal) {
        this.#canvas = canvas;
        this.#xLabel = xLabel;
        this.#yLabel = yLabel;
        this.#yGoal = yGoal;
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

    draw() {
        if (this.#canvas == null) return;
        if (this.#data.length === 0) return;

        const ctx = this.#canvas.getContext("2d");

        const graphColors = [
            "#1447e6",
            "#00bc7d",
            "#fe9a00",
            "#ad46ff",
            "#ff2056",
        ];

        const height = ctx.canvas.height;
        const width = ctx.canvas.width;

        const xs = this.#data.flatMap((d) => d.x);
        const ys = this.#data.flatMap((d) => d.y);

        const xMin = Math.min(...xs);
        const xMax = Math.max(...xs);
        const xLength = Math.max(...this.#data.flatMap((d) => d.x.length));
        const yMin = Math.min(...ys);
        const yMax = Math.max(...ys);
        const yLength = Math.max(...this.#data.flatMap((d) => d.y.length));

        const margin = { t: 64, b: 156, l: 160, r: 64 };

        const clear = () => {
            const color = getComputedStyle(this.#canvas)
                .getPropertyValue("--accent")
                .trim();
            ctx.fillStyle = color;
            ctx.fillRect(0, 0, width, height);
        };

        const drawGrid = () => {
            ctx.beginPath();

            const xCount = Math.min(xLength, 10);
            const yCount = Math.min(yLength, 10);

            for (let i = 0; i < xCount; i++) {
                const pct = i / (xCount - 1);
                const y = (height - margin.t - margin.b) * pct + margin.t;

                // Horizontal Line
                ctx.moveTo(margin.l, y);
                ctx.lineTo(width - margin.r, y);
            }

            for (let i = 0; i < yCount; i++) {
                const pct = i / (yCount - 1);
                const x = (width - margin.l - margin.r) * pct + margin.l;

                // Vertical Line
                ctx.moveTo(x, margin.t);
                ctx.lineTo(x, height - margin.b);
            }

            const color = getComputedStyle(this.#canvas)
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

                const value = remap(pct, 0, 1, xMin, xMax);
                const valueText =
                    value >= 1000
                        ? numberformat.formatShort(value)
                        : round(value, 1);
                const measure = ctx.measureText(valueText);

                const x =
                    remap(pct, 0, 1, margin.l, width - margin.r) -
                    measure.actualBoundingBoxRight * 0.5;
                const y = height - margin.b + 12;
                ctx.fillText(valueText, x, y);
            }
        };

        const drawYAxis = () => {
            const count = Math.min(yLength, 10);

            for (let i = 0; i < count; i++) {
                const pct = i / (count - 1);

                const value = remap(pct, 0, 1, yMax, yMin);
                const valueText =
                    value >= 1000
                        ? numberformat.formatShort(value)
                        : round(value, 1);
                const measure = ctx.measureText(valueText);

                const x = margin.l - measure.actualBoundingBoxRight - 12;
                const y =
                    remap(pct, 0, 1, margin.t, height - margin.b) -
                    measure.actualBoundingBoxDescent * 0.5;
                ctx.fillText(valueText, x, y);
            }
        };

        const drawAxes = () => {
            ctx.font = "24px sans-serif";
            ctx.textBaseline = "top";
            ctx.fillStyle = "white";

            drawXAxis();
            drawYAxis();
        };

        const drawLabels = () => {
            ctx.textAlign = "center";

            // x-label
            ctx.fillText(this.#xLabel, width / 2, height - margin.b + 48);

            // y-label
            ctx.save();

            const yMeasure = ctx.measureText(this.#yLabel);
            ctx.translate(
                margin.l - yMeasure.actualBoundingBoxDescent - 124,
                height / 2,
            );
            ctx.rotate(-Math.PI / 2);
            ctx.fillText(this.#yLabel, 0, 0);

            ctx.restore();

            // algorithm labels
            ctx.textAlign = "left";
            const gap = 24;
            const labelsWidth =
                this.#data
                    .flatMap(
                        (d) => ctx.measureText(d.label).actualBoundingBoxRight,
                    )
                    .reduce((sum, m) => sum + m) +
                2.5 * gap * (this.#data.length - 1);
            let labelCurrentOffset = 0;

            for (let i = 0; i < this.#data.length; i++) {
                const d = this.#data[i];
                const measure = ctx.measureText(d.label);
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
                ctx.fillText(d.label, x + 1.5 * gap, y);
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

                for (let j = 0; j < d.x.length; j++) {
                    const dy = d.y[j];
                    const dx = d.x[j];

                    const wPct = (dx - xMin) / (xMax - xMin);
                    const hPct = (dy - yMin) / (yMax - yMin);
                    const x = (width - margin.l - margin.r) * wPct + margin.l;
                    const y =
                        height -
                        margin.b -
                        (height - margin.t - margin.b) * hPct;

                    if (j === 0) {
                        ctx.beginPath();
                        ctx.moveTo(x, y);
                        continue;
                    }

                    ctx.lineTo(x, y);
                }

                ctx.strokeStyle = graphColors[i];
                ctx.stroke();
            }
        };

        const drawGoals = () => {
            if (!this.#yGoal) return;

            ctx.beginPath();

            const hPct = (this.#yGoal - yMin) / (yMax - yMin);
            const y = height - margin.b - (height - margin.t - margin.b) * hPct;

            ctx.moveTo(margin.l, y);
            ctx.lineTo(width - margin.r, y);

            ctx.strokeStyle = "#ff2056";
            ctx.lineCap = "butt";
            ctx.setLineDash([32, 32]);
            ctx.stroke();
            ctx.setLineDash([]);
        };

        const drawGraph = () => {
            clear();
            drawGrid();
            drawDataLines();
            drawGoals();
            drawAxes();
            drawLabels();
        };

        drawGraph();
    }
}
