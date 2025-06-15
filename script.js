const calculator = Desmos.GraphingCalculator(document.getElementById('calculator'), {
  expressions: true
});

let shiftOn = false;

const expressionSelector = document.getElementById('expressionSelector');
const latexInput = document.getElementById('latexInput');
const statusIndicator = document.getElementById('statusIndicator');

// --- Shift & Keyboard Setup ---
const shiftToggle = document.getElementById('shiftToggle');
shiftToggle.addEventListener('click', () => {
  shiftOn = !shiftOn;
  generateLetters();
});

const greekLetters = [
  "alpha", "beta", "gamma", "delta", "epsilon", "zeta", "eta", "theta", "iota", "kappa",
  "lambda", "mu", "nu", "xi", "omicron", "pi", "rho", "sigma", "tau", "upsilon", "phi",
  "chi", "psi", "omega"
];

function generateLetters() {
  const container = document.getElementById('letters');
  container.querySelectorAll('button:not(#shiftToggle)').forEach(b => b.remove());
  for (let i = 97; i <= 122; i++) {
    const char = String.fromCharCode(i);
    const button = document.createElement('button');
    button.textContent = shiftOn ? char.toUpperCase() : char;
    button.setAttribute("data-insert", shiftOn ? char.toUpperCase() : char);
    container.appendChild(button);
  }
  setupInsertListeners(container);
}

function generateGreek() {
  const greekContainer = document.getElementById('greek');
  greekContainer.innerHTML = '';
  greekLetters.forEach(name => {
    const button = document.createElement('button');
    button.textContent = "\\" + name;
    button.setAttribute("data-insert", "\\" + name);
    greekContainer.appendChild(button);
  });
  setupInsertListeners(greekContainer);
}

generateLetters();
generateGreek();

function setupInsertListeners(container) {
  container.querySelectorAll('button[data-insert]').forEach(button => {
    button.addEventListener('click', () => {
      const insertText = JSON.parse('"' + button.getAttribute("data-insert") + '"');
      const start = latexInput.selectionStart;
      const end = latexInput.selectionEnd;
      latexInput.setRangeText(insertText, start, end, "end");
      sendToDesmos();
    });
  });
}

// --- Tabs ---
document.querySelectorAll('.tab-button').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.getElementById(btn.dataset.tab).classList.add('active');
  });
});
document.querySelector('.tab-button[data-tab="letters"]').click();

// --- Expression Sync ---
function updateExpressionSelector() {
  const expressions = calculator.getExpressions();
  expressionSelector.innerHTML = '';
  expressions.forEach((exp, idx) => {
    if (exp.latex != null) {
      const opt = document.createElement('option');
      opt.value = exp.id;
      opt.textContent = `Line ${idx + 1}`;
      expressionSelector.appendChild(opt);
    }
  });
  if (expressionSelector.options.length > 0) {
    expressionSelector.value = expressions[0].id;
    updateStatus();
  }
}

function updateStatus() {
  const id = expressionSelector.value;
  if (!id) {
    statusIndicator.textContent = "No expression selected.";
  } else {
    statusIndicator.textContent = "Selected: " + id;
  }
}

// --- Sync Handlers ---
function sendToDesmos() {
  const selectedId = expressionSelector.value;
  if (!selectedId) return;
  const expr = { id: selectedId, latex: latexInput.value };
  calculator.setExpression(expr);
}

function getFromDesmos() {
  const selectedId = expressionSelector.value;
  if (!selectedId) return;
  const expr = calculator.getExpressions().find(e => e.id === selectedId);
  if (expr) {
    latexInput.value = expr.latex;
  }
}

// --- Auto Sync ---
latexInput.addEventListener('input', () => {
  sendToDesmos();
});

calculator.observeEvent('change', () => {
  const selectedId = expressionSelector.value;
  const expr = calculator.getExpressions().find(e => e.id === selectedId);
  if (expr) latexInput.value = expr.latex;
  updateExpressionSelector();
});

// --- Initial Expression ---
calculator.setExpressions([{ id: '1', latex: '' }]);
updateExpressionSelector();

// --- Buttons ---
document.getElementById('sendBtn').onclick = sendToDesmos;
document.getElementById('getBtn').onclick = getFromDesmos;
document.getElementById('clearInputBtn').onclick = () => latexInput.value = '';

document.getElementById('saveBtn').onclick = () => {
  const data = calculator.getState();
  localStorage.setItem('desmosGraph', JSON.stringify(data));
  alert('Graph saved locally!');
};

document.getElementById('loadBtn').onclick = () => {
  const data = localStorage.getItem('desmosGraph');
  if (data) {
    calculator.setState(JSON.parse(data));
    updateExpressionSelector();
  }
};

document.getElementById('exportBtn').onclick = () => {
  const blob = new Blob([JSON.stringify(calculator.getState())], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'desmos-graph.json';
  a.click();
};

document.getElementById('importBtn').onclick = () => {
  document.getElementById('importFile').click();
};

document.getElementById('importFile').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    calculator.setState(JSON.parse(reader.result));
    updateExpressionSelector();
  };
  reader.readAsText(file);
});
