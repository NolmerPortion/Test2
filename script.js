const calculator = Desmos.GraphingCalculator(document.getElementById("calculator"));
const latexInput = document.getElementById("latexInput");
const selector = document.getElementById("expressionSelector");
const indicator = document.getElementById("statusIndicator");

let isShift = false;

// アルファベットキーの生成
function createAlphabetButtons() {
  const container = document.getElementById("alphabetButtons");
  container.innerHTML = "";
  const base = isShift ? "A" : "a";
  for (let i = 0; i < 26; i++) {
    const char = String.fromCharCode(base.charCodeAt(0) + i);
    const button = document.createElement("button");
    button.textContent = char;
    button.setAttribute("data-insert", char);
    button.addEventListener("click", () => {
      const insert = button.getAttribute("data-insert");
      const start = latexInput.selectionStart;
      const end = latexInput.selectionEnd;
      latexInput.setRangeText(insert, start, end, "end");
      syncToDesmos();
      latexInput.focus();
    });
    container.appendChild(button);
  }
}

// 初回生成
createAlphabetButtons();

// Shift切替ボタン
document.getElementById("shiftToggle").addEventListener("click", () => {
  isShift = !isShift;
  createAlphabetButtons();
});

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

// Greek/Function キーのイベント登録（alphabetButtons内のボタンは除外）
document.querySelectorAll('[data-insert]').forEach(button => {
  if (button.closest("#alphabetButtons")) return;

  button.addEventListener("click", () => {
    const insert = JSON.parse('"' + button.getAttribute("data-insert") + '"');
    const start = latexInput.selectionStart;
    const end = latexInput.selectionEnd;
    latexInput.setRangeText(insert, start, end, "end");
    syncToDesmos();
    latexInput.focus();
  });
});

document.querySelectorAll(".tab-button").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab-content").forEach(tab => tab.classList.remove("active"));
    document.getElementById(btn.dataset.tab).classList.add("active");
  });
});

// 初期タブ・セレクタ設定
document.querySelector(".tab-button[data-tab='letters']").click();
updateSelector();
