const calculator = Desmos.GraphingCalculator(document.getElementById('calculator'), {
  keypad: false
});

let currentId = null;
let isShift = false;

const latexInput = document.getElementById("latexInput");
const sendBtn = document.getElementById("sendBtn");
const getBtn = document.getElementById("getBtn");
const shiftToggle = document.getElementById("shiftToggle");
const expressionSelector = document.getElementById("expressionSelector");
const statusIndicator = document.getElementById("statusIndicator");

// expression selector
function updateExpressionSelector() {
  const expressions = calculator.getExpressions();
  expressionSelector.innerHTML = "";
  expressions.forEach((exp, index) => {
    const option = document.createElement("option");
    option.value = exp.id;
    option.text = `Line ${index + 1}`;
    expressionSelector.appendChild(option);
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
  if (exp) latexInput.value = exp.latex;
  statusIndicator.textContent = `Editing: ${currentId}`;
});

sendBtn.addEventListener("click", () => {
  const latex = latexInput.value;
  if (!currentId) {
    currentId = "input" + Date.now();
  }
  calculator.setExpression({ id: currentId, latex });
  updateExpressionSelector();
});

getBtn.addEventListener("click", () => {
  if (!currentId) return alert("No expression selected.");
  const exp = calculator.getExpressions().find(e => e.id === currentId);
  if (exp) {
    latexInput.value = exp.latex;
  } else {
    alert("No LaTeX found.");
  }
});

calculator.observeEvent("change", () => {
  if (!currentId) return;
  const exp = calculator.getExpressions().find(e => e.id === currentId);
  if (exp && exp.latex !== latexInput.value) {
    latexInput.value = exp.latex;
  }
});

// Keyboard Tab Toggle
document.querySelectorAll(".tab-button").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab-button").forEach(b => b.classList.remove("active"));
    document.querySelectorAll(".tab-content").forEach(c => c.classList.remove("active"));
    btn.classList.add("active");
    document.getElementById(btn.dataset.tab).classList.add("active");
  });
});
document.querySelector(".tab-button").click();

// Insert buttons
document.querySelectorAll("[data-insert]").forEach(button => {
  const insertText = JSON.parse('"' + button.getAttribute("data-insert") + '"');
  button.addEventListener("click", () => {
    const start = latexInput.selectionStart;
    const end = latexInput.selectionEnd;
    latexInput.setRangeText(insertText, start, end, "end");
    latexInput.focus();
    sendBtn.click();
  });
});

// Clear
document.getElementById("clearInputBtn").addEventListener("click", () => {
  latexInput.value = "";
});

// Shift toggle
function updateAlphabetButtons() {
  const container = document.getElementById("letters");
  container.querySelectorAll("button[data-letter]").forEach(btn => btn.remove());
  for (let i = 97; i <= 122; i++) {
    const char = String.fromCharCode(isShift ? i - 32 : i);
    const btn = document.createElement("button");
    btn.textContent = char;
    btn.dataset.letter = char;
    btn.addEventListener("click", () => {
      const start = latexInput.selectionStart;
      const end = latexInput.selectionEnd;
      latexInput.setRangeText(char, start, end, "end");
      latexInput.focus();
      sendBtn.click();
    });
    container.appendChild(btn);
  }
}
shiftToggle.addEventListener("click", () => {
  isShift = !isShift;
  updateAlphabetButtons();
});
updateAlphabetButtons();

// Greek letters
const greek = [
  "alpha","beta","gamma","delta","epsilon","zeta","eta","theta",
  "iota","kappa","lambda","mu","nu","xi","omicron","pi","rho",
  "sigma","tau","upsilon","phi","chi","psi","omega"
];
const greekContainer = document.getElementById("greek");
greek.forEach(name => {
  const btn = document.createElement("button");
  btn.textContent = name;
  btn.setAttribute("data-insert", `\\${name}`);
  const insertText = JSON.parse('"' + `\\${name}` + '"');
  btn.addEventListener("click", () => {
    const start = latexInput.selectionStart;
    const end = latexInput.selectionEnd;
    latexInput.setRangeText(insertText, start, end, "end");
    latexInput.focus();
    sendBtn.click();
  });
  greekContainer.appendChild(btn);
});

// Save/Load/Export/Import
document.getElementById("saveBtn").addEventListener("click", () => {
  localStorage.setItem("desmos_state", JSON.stringify(calculator.getState()));
  alert("Saved to local storage.");
});

document.getElementById("loadBtn").addEventListener("click", () => {
  const saved = localStorage.getItem("desmos_state");
  if (saved) {
    calculator.setState(JSON.parse(saved));
    updateExpressionSelector();
  } else {
    alert("No saved state.");
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
document.getElementById("importFile").addEventListener("change", e => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const json = JSON.parse(reader.result);
      calculator.setState(json);
      updateExpressionSelector();
    } catch {
      alert("Invalid JSON.");
    }
  };
  reader.readAsText(file);
});
