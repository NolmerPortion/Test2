const calculator = Desmos.GraphingCalculator(document.getElementById('calculator'));

const latexInput = document.getElementById("latexInput");
const sendBtn = document.getElementById("sendBtn");
const getBtn = document.getElementById("getBtn");
const selector = document.getElementById("expressionSelector");
const indicator = document.getElementById("statusIndicator");

// 安全なバックスラッシュ変換関数
function parseLatexInsert(raw) {
  return raw.replace(/\\\\/g, "\\");
}

// 挿入ボタン処理（全タブ共通）
function setupInsertButtons() {
  document.querySelectorAll('[data-insert]').forEach(button => {
    button.addEventListener('click', () => {
      const raw = button.getAttribute("data-insert");
      const insertText = parseLatexInsert(raw);
      const start = latexInput.selectionStart;
      const end = latexInput.selectionEnd;
      latexInput.setRangeText(insertText, start, end, "end");
      latexInput.focus();
      syncToDesmos();
    });
  });
}

// リアルタイム送信
latexInput.addEventListener("input", syncToDesmos);

function syncToDesmos() {
  const id = selector.value;
  if (!id) return;
  calculator.setExpression({ id, latex: latexInput.value });
}

// 選択セレクタ更新
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

// Desmosから取得
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

// イベント監視
calculator.observeEvent('change', () => {
  updateExpressionSelector();
  updateLatexInputFromDesmos();
});

// ボタンイベント
sendBtn.addEventListener("click", syncToDesmos);
getBtn.addEventListener("click", updateLatexInputFromDesmos);

document.getElementById("clearInputBtn").addEventListener("click", () => {
  latexInput.value = "";
  syncToDesmos();
});

document.getElementById("saveBtn").addEventListener("click", () => {
  const state = calculator.getState();
  localStorage.setItem("desmos-graph", JSON.stringify(state));
  alert("Saved to Local Storage.");
});

document.getElementById("loadBtn").addEventListener("click", () => {
  const json = localStorage.getItem("desmos-graph");
  if (json) {
    calculator.setState(JSON.parse(json));
    updateExpressionSelector();
  }
});

document.getElementById("exportBtn").addEventListener("click", () => {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(calculator.getState()));
  const downloadAnchor = document.createElement("a");
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", "desmos_graph.json");
  downloadAnchor.click();
});

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

// タブ切り替え
document.querySelectorAll(".tab-button").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab-content").forEach(tab => tab.classList.remove("active"));
    const target = btn.getAttribute("data-tab");
    document.getElementById(target).classList.add("active");
  });
});

document.querySelector('.tab-button[data-tab="letters"]').click();

setupInsertButtons();
updateExpressionSelector();
