import UnitTest from "./unit-test/unit-test.js";
import "./unit-test/buy-cheapest-test.js";
import "./unit-test/permutations-test.js";
import "./unit-test/filter-buildings-test.js";

const testsWrapper = document.querySelector("#tests");
const runAllBtn = document.querySelector("#run-all");
const succeededText = document.querySelector("#succeeded");
const failedText = document.querySelector("#failed");

const testData = [];

async function run(data) {
    data.button.setAttribute("disabled", "disabled");
    data.img.src = "../images/wait.svg";
    const result = await data.test.instance.run();
    data.img.src = "../images/run.svg";
    data.paragraph.innerText = (result ? "✅ " : "❌ ") + data.test.title;
    data.button.removeAttribute("disabled");
    return result;
}

for (const test of UnitTest.derived) {
    const template = document.createElement("template");
    template.innerHTML = `
        <section class="test">
            <p>❔ ${test.title}</p>
            <button>
                <img src="../images/run.svg" alt="Run" />
            </button>
        </section>
    `.trim();

    const section = template.content.firstElementChild;
    const paragraph = section.querySelector("p");
    const button = section.querySelector("button");
    const img = button.querySelector("img");

    const data = {
        test: test,
        paragraph: paragraph,
        img: img,
        button: button,
    };
    button.addEventListener("click", () => run(data));
    testsWrapper.appendChild(section);
    testData.push(data);
}

runAllBtn.addEventListener("click", async () => {
    runAllBtn.setAttribute("disabled", "disabled");

    const promises = [];
    for (const test of testData) promises.push(run(test));
    const results = await Promise.all(promises);

    const count = results.length;
    const succeeded = results.filter((r) => r).length;
    const failed = count - succeeded;
    succeededText.innerText = `${succeeded}/${count}`;
    failedText.innerText = `${failed}/${count}`;

    runAllBtn.removeAttribute("disabled");
});

succeededText.innerText = `?/${testData.length}`;
failedText.innerText = `?/${testData.length}`;
