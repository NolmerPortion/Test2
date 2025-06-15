const calculator = Desmos.GraphingCalculator(document.getElementById("calculator"));
const latexInput = document.getElementById("latexInput");
const expressionSelector = document.getElementById("expressionSelector");
const sendBtn = document.getElementById("sendBtn");
const getBtn = document.getElementById("getBtn");
const saveBtn = document.getElementById("saveBtn");
const loadBtn = document.getElementById("loadBtn");
const exportBtn = document.getElementById("exportBtn");
const importBtn = document.getElementById("importBtn");
const importFile = document.getElementById("importFile");
const clearInputBtn = document.getElementById("clearInputBtn");
const statusIndicator = document.getElementById("statusIndicator");

let selectedId = null;
let shiftActive = false;

function updateExpressionSelector() {
  expressionSelector.innerHTML = "";
  const expressions = calculator.getExpressions();
  expressions.forEach(expr => {
    if (expr.latex !== undefined) {
      const option = document.createElement("option");
      option.value = expr.id;
      option.textContent = `${expr.id}`;
      expressionSelector.appendChild(option);
    }
  });
}

expressionSelector.addEventListener("change", () => {
  selectedId = expressionSelector.value;
  updateStatus();
  const expr = calculator.getExpressions().find(e => e.id === selectedId);
  if (expr && expr.latex !== undefined) {
    latexInput.value = expr.latex;
  }
});

function updateStatus() {
  if (selectedId) {
    statusIndicator.textContent = `Selected ID: ${selectedId}`;
  } else {
    statusIndicator.textContent = "No expression selected.";
  }
}

sendBtn.addEventListener("click", () => {
  if (!selectedId) {
    const newId = `line${Date.now()}`;
    calculator.setExpression({ id: newId, latex: latexInput.value });
    selectedId = newId;
    updateExpressionSelector();
    expressionSelector.value = selectedId;
  } else {
    calculator.setExpression({ id: selectedId, latex: latexInput.value });
  }
  updateStatus();
});

getBtn.addEventListener("click", () => {
  if (!selectedId) {
    alert("No expression selected.");
    return;
  }
  const expr = calculator.getExpressions().find(e => e.id === selectedId);
  if (expr && expr.latex !== undefined) {
    latexInput.value = expr.latex;
  } else {
    alert("No LaTeX expression found.");
  }
});

calculator.observeEvent('change', () => {
  if (!selectedId) return;
  const expr = calculator.getExpressions().find(e => e.id === selectedId);
  if (expr && expr.latex !== undefined) {
    latexInput.value = expr.latex;
  }
});

saveBtn.addEventListener("click", () => {
  const state = calculator.getState();
  localStorage.setItem("desmosState", JSON.stringify(state));
  alert("State saved to localStorage.");
});

loadBtn.addEventListener("click", () => {
  const state = localStorage.getItem("desmosState");
  if (state) {
    calculator.setState(JSON.parse(state));
    updateExpressionSelector();
    updateStatus();
  }
});

exportBtn.addEventListener("click", () => {
  const state = calculator.getState();
  const blob = new Blob([JSON.stringify(state)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "desmos_state.json";
  a.click();
  URL.revokeObjectURL(url);
});

importBtn.addEventListener("click", () => {
  importFile.click();
});

importFile.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function (event) {
    const json = JSON.parse(event.target.result);
    calculator.setState(json);
    updateExpressionSelector();
    updateStatus();
  };
  reader.readAsText(file);
});

clearInputBtn.addEventListener("click", () => {
  latexInput.value = "";
});

const tabs = document.querySelectorAll(".tab-button");
const tabContents = document.querySelectorAll(".tab-content");
tabs.forEach(tab => {
  tab.addEventListener("click", () => {
    tabs.forEach(t => t.classList.remove("active"));
    tab.classList.add("active");
    const target = tab.getAttribute("data-tab");
    tabContents.forEach(content => {
      content.classList.toggle("active", content.id === target);
    });
  });
});
tabs[0].click(); // default tab

const letters = "abcdefghijklmnopqrstuvwxyz".split("");
const greekLetters = [
  "alpha", "beta", "gamma", "delta", "epsilon", "zeta", "eta", "theta",
  "iota", "kappa", "lambda", "mu", "nu", "xi", "omicron", "pi", "rho",
  "sigma", "tau", "upsilon", "phi", "chi", "psi", "omega"
];

function renderButtons(containerId, items, isGreek = false) {
  const container = document.getElementById(containerId);
  items.forEach(item => {
    const button = document.createElement("button");
    let value = isGreek ? `\\${item}` : item;
    button.textContent = shiftActive && !isGreek ? item.toUpperCase() : item;
    button.setAttribute("data-insert", value);
    container.appendChild(button);
  });
}

renderButtons("letters", letters);
renderButtons("greek", greekLetters, true);

document.getElementById("shiftToggle").addEventListener("click", () => {
  shiftActive = !shiftActive;
  const letterContainer = document.getElementById("letters");
  letterContainer.innerHTML = '<button id="shiftToggle">⇧ Shift</button>';
  renderButtons("letters", letters);
});

document.getElementById("buttonPanel").addEventListener("click", e => {
  if (e.target.tagName === "BUTTON" && e.target.hasAttribute("data-insert")) {
    const raw = e.target.getAttribute("data-insert");
    const insertText = JSON.parse('"' + raw + '"'); // prevent double backslash
    const cursorPos = latexInput.selectionStart;
    const before = latexInput.value.substring(0, cursorPos);
    const after = latexInput.value.substring(cursorPos);
    latexInput.value = before + insertText + after;
    latexInput.focus();
    latexInput.selectionStart = latexInput.selectionEnd = cursorPos + insertText.length;
  }
});
