const calculator = Desmos.GraphingCalculator(document.getElementById("calculator"));
const latexInput = document.getElementById("latexInput");
const sendBtn = document.getElementById("sendBtn");
const getBtn = document.getElementById("getBtn");
const shiftToggle = document.getElementById("shiftToggle");
const tabButtons = document.querySelectorAll(".tab-button");
const tabContents = document.querySelectorAll(".tab-content");
const expressionSelector = document.getElementById("expressionSelector");
const statusIndicator = document.getElementById("statusIndicator");
let shiftOn = false;
let selectedId = null;

// --- Utility for decoding \-escaped strings ---
function decodeInsertString(raw) {
  return JSON.parse('"' + raw + '"');
}

// --- Dynamic keyboard generation ---
const alphabet = [..."abcdefghijklmnopqrstuvwxyz"];
const greekLetters = [
  "alpha", "beta", "gamma", "delta", "epsilon", "zeta", "eta", "theta",
  "iota", "kappa", "lambda", "mu", "nu", "xi", "omicron", "pi", "rho",
  "sigma", "tau", "upsilon", "phi", "chi", "psi", "omega"
];

function generateButtons(containerId, chars, isGreek = false) {
  const container = document.getElementById(containerId);
  chars.forEach(ch => {
    const btn = document.createElement("button");
    btn.textContent = isGreek ? ch : ch.toUpperCase();
    const insertText = isGreek ? `\\${ch}` : ch;
    btn.setAttribute("data-insert", insertText);
    btn.addEventListener("click", () => {
      let insert = insertText;
      if (!isGreek && shiftOn) insert = insert.toUpperCase();
      insertTextAtCursor(decodeInsertString(insert));
    });
    container.appendChild(btn);
  });
}

function insertTextAtCursor(text) {
  const start = latexInput.selectionStart;
  const end = latexInput.selectionEnd;
  const before = latexInput.value.substring(0, start);
  const after = latexInput.value.substring(end);
  latexInput.value = before + text + after;
  latexInput.selectionStart = latexInput.selectionEnd = start + text.length;
  latexInput.focus();
  syncToDesmos(); // Auto-sync
}

// --- Populate buttons ---
generateButtons("letters", alphabet);
generateButtons("greek", greekLetters, true);

// --- Shift toggle ---
shiftToggle.addEventListener("click", () => {
  shiftOn = !shiftOn;
  shiftToggle.classList.toggle("active", shiftOn);
});

// --- Tab switching ---
tabButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    tabContents.forEach(tc => tc.classList.remove("active"));
    document.getElementById(btn.dataset.tab).classList.add("active");
  });
});

// --- Expression sync ---
function updateExpressionSelector() {
  const expressions = calculator.getExpressions();
  expressionSelector.innerHTML = "";
  expressions.forEach((exp, idx) => {
    const opt = document.createElement("option");
    opt.value = exp.id;
    opt.textContent = `Line ${idx + 1}: ${exp.latex || "[empty]"}`;
    expressionSelector.appendChild(opt);
  });
  if (expressions.length > 0) {
    selectedId = expressions[0].id;
    expressionSelector.value = selectedId;
    updateStatus();
  } else {
    selectedId = null;
    updateStatus();
  }
}

expressionSelector.addEventListener("change", () => {
  selectedId = expressionSelector.value;
  updateStatus();
  syncFromDesmos();
});

function updateStatus() {
  statusIndicator.textContent = selectedId
    ? `Selected ID: ${selectedId}`
    : "No expression selected.";
}

// --- Sync input to Desmos ---
function syncToDesmos() {
  if (!selectedId) {
    const id = `expr_${Date.now()}`;
    selectedId = id;
    calculator.setExpression({ id, latex: latexInput.value });
    updateExpressionSelector();
  } else {
    calculator.setExpression({ id: selectedId, latex: latexInput.value });
    updateExpressionSelector();
  }
}

// --- Sync from Desmos ---
function syncFromDesmos() {
  if (!selectedId) return;
  const exp = calculator.getExpressions().find(e => e.id === selectedId);
  if (exp) {
    latexInput.value = exp.latex || "";
  }
}

// --- Auto-sync when Desmos changes ---
calculator.observeEvent('change', () => {
  const exp = calculator.getExpressions().find(e => e.id === selectedId);
  if (exp) latexInput.value = exp.latex || "";
  updateExpressionSelector();
});

// --- Buttons ---
sendBtn.addEventListener("click", syncToDesmos);
getBtn.addEventListener("click", () => {
  if (!selectedId) {
    alert("No expression selected.");
    return;
  }
  syncFromDesmos();
});

// --- Extra buttons ---
document.getElementById("clearInputBtn").addEventListener("click", () => {
  latexInput.value = "";
});

document.getElementById("saveBtn").addEventListener("click", () => {
  localStorage.setItem("savedGraph", JSON.stringify(calculator.getState()));
  alert("Saved to local storage.");
});

document.getElementById("loadBtn").addEventListener("click", () => {
  const data = localStorage.getItem("savedGraph");
  if (data) calculator.setState(JSON.parse(data));
});

document.getElementById("exportBtn").addEventListener("click", () => {
  const dataStr = JSON.stringify(calculator.getState());
  const blob = new Blob([dataStr], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "desmos-graph.json";
  a.click();
});

document.getElementById("importBtn").addEventListener("click", () => {
  document.getElementById("importFile").click();
});

document.getElementById("importFile").addEventListener("change", e => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);
      calculator.setState(data);
    } catch {
      alert("Invalid JSON file.");
    }
  };
  reader.readAsText(file);
});

// --- Initial ---
updateExpressionSelector();
