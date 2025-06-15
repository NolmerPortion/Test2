const calculator = Desmos.GraphingCalculator(document.getElementById('calculator'), {
  keypad: false
});

const input = document.getElementById("latexInput");
const sendBtn = document.getElementById("sendBtn");
const getBtn = document.getElementById("getBtn");
const shiftToggle = document.getElementById("shiftToggle");
const expressionSelector = document.getElementById("expressionSelector");
const statusIndicator = document.getElementById("statusIndicator");

let isShift = false;
let currentId = null;

function updateExpressionSelector() {
  const expressions = calculator.getExpressions();
  expressionSelector.innerHTML = '';
  expressions.forEach((exp, index) => {
    if (exp.id) {
      const option = document.createElement("option");
      option.value = exp.id;
      option.text = `Line ${index + 1} (${exp.id})`;
      expressionSelector.appendChild(option);
    }
  });
  if (expressions.length > 0) {
    currentId = expressions[0].id;
    expressionSelector.value = currentId;
    statusIndicator.textContent = `Editing: ${currentId}`;
  }
}
updateExpressionSelector();

expressionSelector.addEventListener("change", () => {
  currentId = expressionSelector.value;
  const exp = calculator.getExpressions().find(e => e.id === currentId);
  if (exp) {
    input.value = exp.latex || "";
    statusIndicator.textContent = `Editing: ${currentId}`;
  }
});

sendBtn.addEventListener("click", () => {
  const latex = input.value;
  if (!currentId) {
    currentId = 'custom' + Date.now();
    calculator.setExpression({ id: currentId, latex });
    updateExpressionSelector();
  } else {
    calculator.setExpression({ id: currentId, latex });
  }
});

getBtn.addEventListener("click", () => {
  if (!currentId) {
    alert("No expression selected.");
    return;
  }
  const exp = calculator.getExpressions().find(e => e.id === currentId);
  if (exp && exp.latex) {
    input.value = exp.latex;
  } else {
    alert("No LaTeX found for selected expression.");
  }
});

calculator.observeEvent('change', () => {
  if (!currentId) return;
  const exp = calculator.getExpressions().find(e => e.id === currentId);
  if (exp && exp.latex !== input.value) {
    input.value = exp.latex;
  }
});

// TAB + BUTTON INJECTION
const tabs = document.querySelectorAll('.tab-button');
const tabContents = document.querySelectorAll('.tab-content');

tabs.forEach(btn => {
  btn.addEventListener('click', () => {
    tabs.forEach(t => t.classList.remove('active'));
    tabContents.forEach(tc => tc.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(btn.dataset.tab).classList.add('active');
  });
});
tabs[0].click();

// Insert character
function insertAtCursor(text) {
  const start = input.selectionStart;
  const end = input.selectionEnd;
  input.value = input.value.slice(0, start) + text + input.value.slice(end);
  input.selectionStart = input.selectionEnd = start + text.length;
  input.focus();
  sendBtn.click();
}

// Shift toggle
shiftToggle.addEventListener("click", () => {
  isShift = !isShift;
  updateAlphabetButtons();
  shiftToggle.classList.toggle("active", isShift);
});

// Alphabet
function updateAlphabetButtons() {
  const container = document.getElementById("letters");
  container.querySelectorAll("button[data-letter]").forEach(btn => btn.remove());

  for (let i = 97; i <= 122; i++) {
    const ch = String.fromCharCode(isShift ? i - 32 : i);
    const btn = document.createElement("button");
    btn.textContent = ch;
    btn.dataset.letter = ch;
    btn.addEventListener("click", () => insertAtCursor(ch));
    container.appendChild(btn);
  }
}
updateAlphabetButtons();

// Greek
const greek = [
  "alpha", "beta", "gamma", "delta", "epsilon", "zeta", "eta", "theta",
  "iota", "kappa", "lambda", "mu", "nu", "xi", "omicron", "pi", "rho",
  "sigma", "tau", "upsilon", "phi", "chi", "psi", "omega"
];
const greekContainer = document.getElementById("greek");
greek.forEach(name => {
  const btn = document.createElement("button");
  btn.textContent = name;
  btn.setAttribute("data-insert", `\\${name}`);
  greekContainer.appendChild(btn);
});

// Function insert
document.querySelectorAll('[data-insert]').forEach(button => {
  const raw = button.getAttribute("data-insert");
  const text = JSON.parse(`"${raw}"`);
  button.addEventListener("click", () => insertAtCursor(text));
});

// Save/load/export/import
document.getElementById("saveBtn").addEventListener("click", () => {
  const state = calculator.getState();
  localStorage.setItem("desmos_state", JSON.stringify(state));
  alert("Saved to local storage.");
});

document.getElementById("loadBtn").addEventListener("click", () => {
  const state = localStorage.getItem("desmos_state");
  if (state) {
    calculator.setState(JSON.parse(state));
    updateExpressionSelector();
    alert("Loaded from local storage.");
  }
});

document.getElementById("exportBtn").addEventListener("click", () => {
  const blob = new Blob([JSON.stringify(calculator.getState(), null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "desmos_graph.json";
  a.click();
});

document.getElementById("importBtn").addEventListener("click", () => {
  document.getElementById("importFile").click();
});
document.getElementById("importFile").addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);
      calculator.setState(data);
      updateExpressionSelector();
      alert("Imported successfully.");
    } catch {
      alert("Invalid file format.");
    }
  };
  reader.readAsText(file);
});
