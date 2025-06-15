const calculator = Desmos.GraphingCalculator(document.getElementById('calculator'));
let shiftEnabled = false;

// Track current expression ID
let currentExpressionId = null;

function updateSelector() {
  const expressions = calculator.getExpressions();
  const selector = document.getElementById("expressionSelector");
  selector.innerHTML = "";
  expressions.forEach(expr => {
    if (expr.id) {
      const option = document.createElement("option");
      option.value = expr.id;
      option.textContent = expr.id;
      selector.appendChild(option);
    }
  });
}

function syncLatexToTextarea() {
  const selectedId = document.getElementById("expressionSelector").value;
  const expr = calculator.getExpressions().find(e => e.id === selectedId);
  if (expr && expr.latex != null) {
    document.getElementById("latexInput").value = expr.latex;
    document.getElementById("statusIndicator").textContent = `Editing ID: ${selectedId}`;
  } else {
    document.getElementById("statusIndicator").textContent = "No expression selected.";
  }
}

// Auto-insert characters
document.getElementById("buttonPanel").addEventListener("click", (e) => {
  if (e.target.tagName === "BUTTON" && e.target.dataset.insert) {
    const textArea = document.getElementById("latexInput");
    const insertText = JSON.parse('"' + e.target.getAttribute("data-insert") + '"');
    const start = textArea.selectionStart;
    const end = textArea.selectionEnd;
    textArea.value = textArea.value.slice(0, start) + insertText + textArea.value.slice(end);
    textArea.selectionStart = textArea.selectionEnd = start + insertText.length;

    document.getElementById("sendBtn").click();
  }
});

// Tab functionality
document.querySelectorAll(".tab-button").forEach(button => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".tab-button").forEach(btn => btn.classList.remove("active"));
    button.classList.add("active");

    document.querySelectorAll(".tab-content").forEach(tc => tc.style.display = "none");
    document.getElementById(button.dataset.tab).style.display = "flex";
  });
});
document.querySelector(".tab-button[data-tab='letters']").click();

// Greek letters
const greekLetters = [
  "alpha", "beta", "gamma", "delta", "epsilon", "zeta", "eta", "theta",
  "iota", "kappa", "lambda", "mu", "nu", "xi", "omicron", "pi", "rho",
  "sigma", "tau", "upsilon", "phi", "chi", "psi", "omega"
];
const greekDiv = document.getElementById("greek");
greekLetters.forEach(letter => {
  const btn = document.createElement("button");
  btn.setAttribute("data-insert", `\\${letter}`);
  btn.textContent = letter;
  greekDiv.appendChild(btn);
});

// Alphabet letters
const alphabetDiv = document.getElementById("letters");
const shiftBtn = document.getElementById("shiftToggle");
shiftBtn.addEventListener("click", () => {
  shiftEnabled = !shiftEnabled;
  shiftBtn.classList.toggle("active", shiftEnabled);
  renderAlphabet();
});
function renderAlphabet() {
  const letters = "abcdefghijklmnopqrstuvwxyz".split("");
  alphabetDiv.innerHTML = "";
  alphabetDiv.appendChild(shiftBtn);
  letters.forEach(letter => {
    const btn = document.createElement("button");
    const char = shiftEnabled ? letter.toUpperCase() : letter;
    btn.setAttribute("data-insert", char);
    btn.textContent = char;
    alphabetDiv.appendChild(btn);
  });
}
renderAlphabet();

// Send to Desmos
document.getElementById("sendBtn").addEventListener("click", () => {
  const id = document.getElementById("expressionSelector").value;
  const latex = document.getElementById("latexInput").value;
  calculator.setExpression({ id, latex });
  syncLatexToTextarea();
});

// Get from Desmos
document.getElementById("getBtn").addEventListener("click", syncLatexToTextarea);

// Clear
document.getElementById("clearInputBtn").addEventListener("click", () => {
  document.getElementById("latexInput").value = "";
});

// Load Selector on init
updateSelector();
setTimeout(updateSelector, 1000);

// Expression selector change
document.getElementById("expressionSelector").addEventListener("change", syncLatexToTextarea);

// Mutation observer for changes
const observer = new MutationObserver(() => {
  syncLatexToTextarea();
});
observer.observe(document.getElementById("calculator"), { childList: true, subtree: true });

// Save to localStorage
document.getElementById("saveBtn").addEventListener("click", () => {
  const expressions = calculator.getExpressions();
  localStorage.setItem("desmosGraph", JSON.stringify(expressions));
  alert("Saved!");
});

// Load from localStorage
document.getElementById("loadBtn").addEventListener("click", () => {
  const data = localStorage.getItem("desmosGraph");
  if (data) calculator.setExpressions(JSON.parse(data));
  updateSelector();
});

// Export JSON
document.getElementById("exportBtn").addEventListener("click", () => {
  const data = JSON.stringify(calculator.getExpressions(), null, 2);
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "desmos_graph.json";
  a.click();
  URL.revokeObjectURL(url);
});

// Import JSON
document.getElementById("importBtn").addEventListener("click", () => {
  document.getElementById("importFile").click();
});
document.getElementById("importFile").addEventListener("change", (e) => {
  const file = e.target.files[0];
  const reader = new FileReader();
  reader.onload = () => {
    calculator.setExpressions(JSON.parse(reader.result));
    updateSelector();
  };
  reader.readAsText(file);
});
