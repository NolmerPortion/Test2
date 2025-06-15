document.addEventListener("DOMContentLoaded", () => {
  const calculator = Desmos.GraphingCalculator(document.getElementById("calculator"));
  const input = document.getElementById("latexInput");

  const sendBtn = document.getElementById("sendBtn");
  const clearInputBtn = document.getElementById("clearInputBtn");
  const pullBtn = document.getElementById("pullBtn");

  // 挿入ボタン処理（ギリシャ文字など）
  document.querySelectorAll("#buttonPanel button").forEach(button => {
    button.addEventListener("click", () => {
      const insertText = button.getAttribute("data-insert");
      insertAtCursor(input, insertText);
    });
  });

  // ライブプレビュー（リアルタイム更新）
  input.addEventListener("input", () => {
    const latex = input.value.trim();
    const selected = calculator.getSelectedExpression();
    if (selected && selected.id) {
      calculator.setExpression({ id: selected.id, latex });
    } else {
      calculator.setExpression({ id: "live_preview", latex });
    }
  });

  // Desmosに送信（選択中の行があれば上書き、なければ新規作成）
  sendBtn.addEventListener("click", () => {
    const latex = input.value.trim();
    if (latex === "") return;

    const selected = calculator.getSelectedExpression();
    if (selected && selected.id) {
      calculator.setExpression({ id: selected.id, latex });
    } else {
      const id = "expr" + Date.now();
      calculator.setExpression({ id, latex });
      calculator.setSelectedExpression({ id });
    }
  });

  // Clear入力欄とプレビュー式
  clearInputBtn.addEventListener("click", () => {
    input.value = "";
    calculator.removeExpression({ id: "live_preview" });
    input.focus();
  });

  // Desmosから取得（選択中の式を入力欄に）
  pullBtn.addEventListener("click", () => {
    const selected = calculator.getSelectedExpression();
    if (selected && typeof selected.latex === "string") {
      input.value = selected.latex;
      input.focus();
    } else {
      alert("数式ラインが選択されていません。");
    }
  });

  // テキストエリア内のカーソル位置に文字を挿入
  function insertAtCursor(textarea, text) {
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const value = textarea.value;
    textarea.value = value.slice(0, start) + text + value.slice(end);
    textarea.selectionStart = textarea.selectionEnd = start + text.length;
    textarea.focus();
  }
});
