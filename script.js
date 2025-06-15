const calculator = Desmos.GraphingCalculator(document.getElementById('calculator'));

const latexInput = document.getElementById("latexInput");
const sendBtn = document.getElementById("sendBtn");
const getBtn = document.getElementById("getBtn");
const selector = document.getElementById("expressionSelector");
const indicator = document.getElementById("statusIndicator");

// Tabs
document.querySelectorAll(".tab-button").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab-content").forEach(tab => tab.classList.remove("active"));
    document.getElementById(btn.dataset.tab).classList.add("active");
  });
});

// Insert character with escape fix
document.querySelectorAll('[data-insert]').forEach(button => {
  button.addEventListener('click', () => {
    const insertText = JSON.parse('"' + button.getAttribute("data-insert") + '"');
    const start = latexInput.selectionStart;
    const end = latexInput.selectionEnd;
    latexInput.setRangeText(insertText, start, end, "end");
    syncToDesmos();
  });
});

function syncToDesmos() {
  const id = selector.value;
  if (!id) return;
  calculator.setExpression({ id, latex: latexInput.value });
}

// Real-time update from input
latexInput.addEventListener("input", syncToDesmos);

// Update selector list
function updateExpressionSelector() {
  const expressions = calculator.getExpressions();
  selector.innerHTML = "";
  expressions.forEach(expr => {
    const option = document.createElement("option");
    option.value = expr.id;
    option.textContent = expr.id;
    selector.appendChild(option);
  });
  if (expressions.length > 0) {
    selector.value = expressions[0].id;
    updateLatexInputFromDesmos();
  }
}

// Update input from Desmos
function updateLatexInputFromDesmos() {
  const id = selector.value;
  const expr = calculator.getExpressions().find(e => e.id === id);
  if (expr && expr.latex !== undefined) {
    latexInput.value = expr.latex;
    indicator.textContent = "Selected: " + id;
  } else {
    indicator.textContent = "No expression selected.";
  }
}

// Listen for manual Desmos edits
calculator.observeEvent('change', () => {
  updateExpressionSelector();
  updateLatexInputFromDesmos();
});

// Send button
sendBtn.addEventListener("click", syncToDesmos);

// Get button
getBtn.addEventListener("click", updateLatexInputFromDesmos);

// Clear input
document.getElementById("clearInputBtn").addEventListener("click", () => {
  latexInput.value = "";
  syncToDesmos();
});

// Save to local
document.getElementById("saveBtn").addEventListener("click", () => {
  const state = calculator.getState();
  localStorage.setItem("desmos-graph", JSON.stringify(state));
  alert("Graph saved to local storage.");
});

// Load from local
document.getElementById("loadBtn").addEventListener("click", () => {
  const json = localStorage.getItem("desmos-graph");
  if (json) {
    calculator.setState(JSON.parse(json));
    updateExpressionSelector();
  } else {
    alert("No saved graph found.");
  }
});

// Export JSON
document.getElementById("exportBtn").addEventListener("click", () => {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(calculator.getState()));
  const downloadAnchor = document.createElement("a");
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", "desmos_graph.json");
  downloadAnchor.click();
});

// Import JSON
document.getElementById("importBtn").addEventListener("click", () => {
  document.getElementById("importFile").click();
});

document.getElementById("importFile").addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    const json = JSON.parse(e.target.result);
    calculator.setState(json);
    updateExpressionSelector();
  };
  reader.readAsText(file);
});

// Keyboard: Shift toggle
let shiftOn = false;
const shiftBtn = document.getElementById("shiftToggle");
shiftBtn.addEventListener("click", () => {
  shiftOn = !shiftOn;
  renderLetters();
});

function renderLetters() {
  const container = document.getElementById("letters");
  const chars = "abcdefghijklmnopqrstuvwxyz".split("");
  container.innerHTML = "";
  container.appendChild(shiftBtn);
  chars.forEach(ch => {
    const btn = document.createElement("button");
    btn.setAttribute("data-insert", shiftOn ? ch.toUpperCase() : ch);
    btn.textContent = shiftOn ? ch.toUpperCase() : ch;
    container.appendChild(btn);
  });
  document.querySelectorAll('#letters [data-insert]').forEach(button => {
    button.addEventListener('click', () => {
      const insertText = JSON.parse('"' + button.getAttribute("data-insert") + '"');
      const start = latexInput.selectionStart;
      const end = latexInput.selectionEnd;
      latexInput.setRangeText(insertText, start, end, "end");
      syncToDesmos();
    });
  });
}

function renderGreek() {
  const greek = [
    "\\alpha", "\\beta", "\\gamma", "\\delta", "\\epsilon", "\\zeta",
    "\\eta", "\\theta", "\\iota", "\\kappa", "\\lambda", "\\mu", "\\nu",
    "\\xi", "\\omicron", "\\pi", "\\rho", "\\sigma", "\\tau", "\\upsilon",
    "\\phi", "\\chi", "\\psi", "\\omega"
  ];
  const container = document.getElementById("greek");
  greek.forEach(symbol => {
    const btn = document.createElement("button");
    btn.setAttribute("data-insert", symbol);
    btn.textContent = symbol.replace("\\", "");
    container.appendChild(btn);
  });
  document.querySelectorAll('#greek [data-insert]').forEach(button => {
    button.addEventListener('click', () => {
      const insertText = JSON.parse('"' + button.getAttribute("data-insert") + '"');
      const start = latexInput.selectionStart;
      const end = latexInput.selectionEnd;
      latexInput.setRangeText(insertText, start, end, "end");
      syncToDesmos();
    });
  });
}

renderLetters();
renderGreek();
updateExpressionSelector();
