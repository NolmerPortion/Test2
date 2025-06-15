const calculator = Desmos.GraphingCalculator(document.getElementById('calculator'), {
  keypad: false,
  expressions: true,
  settingsMenu: false,
  invertedColors: false
});

let currentExprId = null;
let shiftMode = false;

const latexInput = document.getElementById('latexInput');
const expressionSelector = document.getElementById('expressionSelector');
const statusIndicator = document.getElementById('statusIndicator');

// --- Tab control ---
document.querySelectorAll('.tab-button').forEach(button => {
  button.addEventListener('click', () => {
    document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(panel => panel.classList.remove('active'));
    button.classList.add('active');
    document.getElementById(button.getAttribute('data-tab')).classList.add('active');
  });
});

// --- Build alphabet ---
function createAlphabetButtons() {
  const container = document.getElementById('letters');
  for (let i = 97; i <= 122; i++) {
    const letter = String.fromCharCode(i);
    const btn = document.createElement('button');
    btn.textContent = letter;
    btn.dataset.insert = shiftMode ? letter.toUpperCase() : letter;
    btn.addEventListener('click', () => {
      insertToTextBox(btn.dataset.insert);
    });
    container.appendChild(btn);
  }
}

function updateAlphabetShift() {
  const buttons = document.querySelectorAll('#letters button:not(#shiftToggle)');
  buttons.forEach((btn, index) => {
    const base = String.fromCharCode(97 + index);
    btn.textContent = shiftMode ? base.toUpperCase() : base;
    btn.dataset.insert = shiftMode ? base.toUpperCase() : base;
  });
}

// --- Build Greek ---
function createGreekButtons() {
  const greek = [
    "alpha","beta","gamma","delta","epsilon","zeta","eta","theta","iota","kappa",
    "lambda","mu","nu","xi","omicron","pi","rho","sigma","tau","upsilon","phi","chi","psi","omega"
  ];
  const container = document.getElementById('greek');
  greek.forEach(name => {
    const btn = document.createElement('button');
    btn.textContent = shiftMode ? name.charAt(0).toUpperCase() + name.slice(1) : name;
    btn.dataset.insert = `\\${shiftMode ? name.toUpperCase() : name}`;
    btn.addEventListener('click', () => {
      insertToTextBox(btn.dataset.insert);
    });
    container.appendChild(btn);
  });
}

// --- Shift toggle ---
document.getElementById('shiftToggle').addEventListener('click', () => {
  shiftMode = !shiftMode;
  updateAlphabetShift();
});

// --- Insertion ---
function insertToTextBox(text) {
  const insertText = JSON.parse('"' + text + '"');
  const cursor = latexInput.selectionStart;
  const current = latexInput.value;
  latexInput.value = current.slice(0, cursor) + insertText + current.slice(cursor);
  latexInput.focus();
  latexInput.selectionEnd = cursor + insertText.length;
  sendToDesmos();
}

// --- Send to Desmos ---
function sendToDesmos() {
  if (!currentExprId) {
    currentExprId = calculator.setExpression({ latex: latexInput.value });
    refreshSelector();
  } else {
    calculator.setExpression({ id: currentExprId, latex: latexInput.value });
  }
  statusIndicator.textContent = `Expression ${currentExprId} updated`;
}

// --- Get from Desmos ---
function getFromDesmos() {
  if (!currentExprId) {
    alert("No expression selected.");
    return;
  }
  const expr = calculator.getExpressions().find(e => e.id === currentExprId);
  if (expr && expr.latex) {
    latexInput.value = expr.latex;
    statusIndicator.textContent = `Expression ${currentExprId} loaded`;
  } else {
    alert("No LaTeX found in selected expression.");
  }
}

// --- Expression selector ---
function refreshSelector() {
  const expressions = calculator.getExpressions();
  expressionSelector.innerHTML = "";
  expressions.forEach((expr, index) => {
    const opt = document.createElement('option');
    opt.value = expr.id;
    opt.textContent = `Line ${index + 1}`;
    if (expr.id === currentExprId) opt.selected = true;
    expressionSelector.appendChild(opt);
  });
}

expressionSelector.addEventListener('change', () => {
  currentExprId = expressionSelector.value;
  getFromDesmos();
});

// --- Real-time updates from Desmos ---
calculator.observeEvent('change', () => {
  if (!currentExprId) return;
  const expr = calculator.getExpressions().find(e => e.id === currentExprId);
  if (expr && expr.latex && latexInput.value !== expr.latex) {
    latexInput.value = expr.latex;
    statusIndicator.textContent = `Expression ${currentExprId} synced`;
  }
});

// --- Other buttons ---
document.getElementById('sendBtn').onclick = sendToDesmos;
document.getElementById('getBtn').onclick = getFromDesmos;
document.getElementById('clearInputBtn').onclick = () => { latexInput.value = ""; };

// --- Save/load/export/import ---
document.getElementById('saveBtn').onclick = () => {
  const data = calculator.getExpressions();
  localStorage.setItem("desmosData", JSON.stringify(data));
  alert("Saved locally.");
};

document.getElementById('loadBtn').onclick = () => {
  const data = localStorage.getItem("desmosData");
  if (data) calculator.setExpressions(JSON.parse(data));
  refreshSelector();
};

document.getElementById('exportBtn').onclick = () => {
  const blob = new Blob([JSON.stringify(calculator.getExpressions())], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = "desmos-export.json";
  a.click();
};

document.getElementById('importBtn').onclick = () => {
  document.getElementById('importFile').click();
};

document.getElementById('importFile').onchange = evt => {
  const file = evt.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    const json = JSON.parse(e.target.result);
    calculator.setExpressions(json);
    refreshSelector();
  };
  reader.readAsText(file);
};

// --- Init ---
createAlphabetButtons();
createGreekButtons();
refreshSelector();
