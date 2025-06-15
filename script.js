document.addEventListener("DOMContentLoaded", () => {
  const calculator = Desmos.GraphingCalculator(document.getElementById('calculator'));

  const greekLetters = [
    ['alpha', 'beta', 'gamma', 'delta', 'epsilon', 'zeta', 'eta', 'theta', 'iota', 'kappa',
     'lambda', 'mu', 'nu', 'xi', 'omicron', 'pi', 'rho', 'sigma', 'tau', 'upsilon',
     'phi', 'chi', 'psi', 'omega'],
    ['Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon', 'Zeta', 'Eta', 'Theta', 'Iota', 'Kappa',
     'Lambda', 'Mu', 'Nu', 'Xi', 'Omicron', 'Pi', 'Rho', 'Sigma', 'Tau', 'Upsilon',
     'Phi', 'Chi', 'Psi', 'Omega']
  ];

  let shift = false;
  const virtualInput = document.getElementById("virtual-input");
  const keyboardDiv = document.getElementById("keyboard");

  function renderKeyboard() {
    keyboardDiv.innerHTML = "";
    const letters = shift ? greekLetters[1] : greekLetters[0];
    letters.forEach(letter => {
      const button = document.createElement("button");
      button.textContent = letter;
      const latex = `\\${letter}`;
      button.addEventListener("click", () => {
        insertAtCursor(virtualInput, latex);
      });
      keyboardDiv.appendChild(button);
    });

    // Shift toggle button
    const shiftButton = document.createElement("button");
    shiftButton.textContent = shift ? "Shift ON" : "Shift OFF";
    shiftButton.addEventListener("click", () => {
      shift = !shift;
      renderKeyboard();
    });
    keyboardDiv.appendChild(shiftButton);
  }

  function insertAtCursor(el, text) {
    el.focus();
    const selection = window.getSelection();
    const range = selection.getRangeAt(0);
    range.deleteContents();
    range.insertNode(document.createTextNode(text));
    // Move cursor to after inserted text
    range.setStartAfter(range.endContainer);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);
  }

  document.getElementById("sendBtn").addEventListener("click", () => {
    const latex = virtualInput.textContent;
    const exprId = `expr${Date.now()}`;
    calculator.setExpression({ id: exprId, latex });
  });

  document.getElementById("clearBtn").addEventListener("click", () => {
    virtualInput.innerHTML = '';
  });

  renderKeyboard();
});
