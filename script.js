document.addEventListener("DOMContentLoaded", () => {
  const elt = document.getElementById('calculator');
  const calculator = Desmos.GraphingCalculator(elt); // ← Desmos初期化

  const shiftBtn = document.getElementById("shiftBtn");
  const keyboardDiv = document.getElementById("keyboard");
  const clipboardHelper = document.getElementById("clipboardHelper");

  let shift = false;

  const greekLetters = [
    ['alpha', 'beta', 'gamma', 'delta', 'epsilon', 'zeta', 'eta', 'theta', 'iota', 'kappa',
     'lambda', 'mu', 'nu', 'xi', 'omicron', 'pi', 'rho', 'sigma', 'tau', 'upsilon',
     'phi', 'chi', 'psi', 'omega'],
    ['Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon', 'Zeta', 'Eta', 'Theta', 'Iota', 'Kappa',
     'Lambda', 'Mu', 'Nu', 'Xi', 'Omicron', 'Pi', 'Rho', 'Sigma', 'Tau', 'Upsilon',
     'Phi', 'Chi', 'Psi', 'Omega']
  ];

  function renderKeyboard() {
    keyboardDiv.innerHTML = '';
    const letters = shift ? greekLetters[1] : greekLetters[0];
    letters.forEach(letter => {
      const button = document.createElement('button');
      button.textContent = letter;
      const latex = `\\${letter}`;
      button.addEventListener('click', () => {
        clipboardHelper.value = latex;
        clipboardHelper.focus();
        clipboardHelper.select();
        alert(`\\${letter} をコピーしました。\n数式にカーソルを合わせ、ペースト(Ctrl+Vまたは長押し)してください。`);
      });
      keyboardDiv.appendChild(button);
    });
  }

  shiftBtn.addEventListener("click", () => {
    shift = !shift;
    shiftBtn.textContent = shift ? "ON" : "OFF";
    renderKeyboard();
  });

  renderKeyboard(); // 初回実行
});
