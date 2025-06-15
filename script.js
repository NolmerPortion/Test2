const calculator = Desmos.GraphingCalculator(document.getElementById("calculator"));
const latexInput = document.getElementById("latexInput");
const selector = document.getElementById("expressionSelector");
const indicator = document.getElementById("statusIndicator");

let alphabetShiftOn = false;
let greekShiftOn = false;

function updateSelector() {
  const expressions = calculator.getExpressions();
  const currentId = selector.value;
  selector.innerHTML = "";
  expressions.forEach((e, i) => {
    const opt = document.createElement("option");
    opt.value = e.id;
    opt.textContent = `Line ${i + 1}`;
    selector.appendChild(opt);
  });
  if (expressions.find(e => e.id === currentId)) {
    selector.value = currentId;
  } else if (expressions.length > 0) {
    selector.value = expressions[0].id;
  }
}

function syncToDesmos() {
  const id = selector.value;
  if (!id) return;
  calculator.setExpression({ id, latex: latexInput.value });
}

function updateFromDesmos() {
  const expr = calculator.getExpressions().find(e => e.id === selector.value);
  if (expr && expr.latex !== undefined) {
    latexInput.value = expr.latex;
    indicator.textContent = `Selected: ${selector.options[selector.selectedIndex].text}`;
  }
}

selector.addEventListener("change", updateFromDesmos);
document.getElementById("sendBtn").onclick = syncToDesmos;
document.getElementById("getBtn").onclick = updateFromDesmos;
document.getElementById("clearInputBtn").onclick = () => {
  latexInput.value = "";
  syncToDesmos();
};

calculator.observeEvent("change", () => {
  updateSelector();
  updateFromDesmos();
});

latexInput.addEventListener("input", syncToDesmos);

document.querySelectorAll('[data-insert]').forEach(button => {
  button.addEventListener("click", () => {
    const rawInsert = button.getAttribute("data-insert");
    const insert = button.closest("#functions") ? JSON.parse('"' + rawInsert + '"') : rawInsert;
    const start = latexInput.selectionStart;
    const end = latexInput.selectionEnd;
    latexInput.setRangeText(insert, start, end, "end");
    syncToDesmos();
    latexInput.focus();
  });
});

// Alphabet Shift
document.getElementById("shiftToggle").addEventListener("click", () => {
  alphabetShiftOn = !alphabetShiftOn;
  renderAlphabetKeys();
});

// Greek Shift
document.getElementById("greekShiftToggle").addEventListener("click", () => {
  greekShiftOn = !greekShiftOn;
  renderGreekKeys();
});

function renderAlphabetKeys() {
  const container = document.getElementById("alphabetButtons");
  container.innerHTML = "";
  for (let i = 97; i <= 122; i++) {
    const char = String.fromCharCode(i);
    const label = alphabetShiftOn ? char.toUpperCase() : char;
    const btn = document.createElement("button");
    btn.textContent = label;
    btn.setAttribute("data-insert", label);
    btn.addEventListener("click", () => {
      const insert = btn.getAttribute("data-insert");
      const start = latexInput.selectionStart;
      const end = latexInput.selectionEnd;
      latexInput.setRangeText(insert, start, end, "end");
      syncToDesmos();
      latexInput.focus();
    });
    container.appendChild(btn);
  }
}

function renderGreekKeys() {
  const greekMap = {
    alpha: ["α", "Α"], beta: ["β", "Β"], gamma: ["γ", "Γ"], delta: ["δ", "Δ"],
    epsilon: ["ε", "Ε"], zeta: ["ζ", "Ζ"], eta: ["η", "Η"], theta: ["θ", "Θ"],
    iota: ["ι", "Ι"], kappa: ["κ", "Κ"], lambda: ["λ", "Λ"], mu: ["μ", "Μ"],
    nu: ["ν", "Ν"], xi: ["ξ", "Ξ"], omicron: ["ο", "Ο"], pi: ["π", "Π"],
    rho: ["ρ", "Ρ"], sigma: ["σ", "Σ"], tau: ["τ", "Τ"], upsilon: ["υ", "Υ"],
    phi: ["φ", "Φ"], chi: ["χ", "Χ"], psi: ["ψ", "Ψ"], omega: ["ω", "Ω"]
  };

  const capitalizeFirst = str => str.charAt(0).toUpperCase() + str.slice(1);

  const container = document.getElementById("greekButtons");
  container.innerHTML = "";
  for (const [name, [lower, upper]] of Object.entries(greekMap)) {
    const label = greekShiftOn ? upper : lower;
    const latex = greekShiftOn ? `\\${capitalizeFirst(name)}` : `\\${name}`;
    const btn = document.createElement("button");
    btn.textContent = label;
    btn.setAttribute("data-insert", latex);
    btn.addEventListener("click", () => {
      const insert = btn.getAttribute("data-insert");
      const start = latexInput.selectionStart;
      const end = latexInput.selectionEnd;
      latexInput.setRangeText(insert, start, end, "end");
      syncToDesmos();
      latexInput.focus();
    });
    container.appendChild(btn);
  }
}

document.querySelectorAll(".tab-button").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab-content").forEach(tab => tab.classList.remove("active"));
    document.getElementById(btn.dataset.tab).classList.add("active");
  });
});
document.querySelector(".tab-button[data-tab='letters']").click();
updateSelector();
renderAlphabetKeys();
renderGreekKeys();

document.getElementById("saveBtn").onclick = () => {
  const data = calculator.getState();
  localStorage.setItem("desmosGraph", JSON.stringify(data));
  alert("Saved to local storage.");
};
document.getElementById("loadBtn").onclick = () => {
  const data = localStorage.getItem("desmosGraph");
  if (data) calculator.setState(JSON.parse(data));
};
document.getElementById("exportBtn").onclick = () => {
  const data = calculator.getState();
  const blob = new Blob([JSON.stringify(data)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "desmos_graph.json";
  a.click();
  URL.revokeObjectURL(url);
};
document.getElementById("importBtn").onclick = () => {
  document.getElementById("importFile").click();
};
document.getElementById("importFile").addEventListener("change", event => {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    try {
      calculator.setState(JSON.parse(e.target.result));
    } catch {
      alert("Invalid JSON file.");
    }
  };
  reader.readAsText(file);
});
