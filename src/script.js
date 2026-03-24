const algoSelect = document.getElementById('algo-select');
const algoCount = document.getElementById('algo-count');
const bruteforceCond = document.getElementById('cond-bruteforce');
const toast = document.getElementById('toast');

function updateCount() {
    const count = algoSelect.selectedOptions.length;
    algoCount.textContent = count + ' algorithm' + (count === 1 ? '' : 's') + ' selected';
    bruteforceCond.classList.toggle('visible', 
        Array.from(algoSelect.selectedOptions).some(o => o.value === 'bruteforce'));
}

function show(msg) {
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2000);
}

algoSelect.addEventListener('change', updateCount);

document.getElementById('btn-run').addEventListener('click', () => {
    if (algoSelect.selectedOptions.length === 0) {
        show('Select at least one algorithm');
        return;
    }
    show('Running benchmark...')
    // TODO: Run benchmark
});

document.getElementById('btn-reset').addEventListener('click', () => {
    algoSelect.selectedIndex = -1;
    document.getElementById('bruteforce-segment').value = 5;
    document.getElementById('target-type').value = 'cookies';
    document.getElementById('target-value').value = 1000;
    document.getElementById('max-sim-time').value = 3600;
    updateCount();
    show('Reset');
});

updateCount();