const calculator = Desmos.GraphingCalculator(document.getElementById('calculator'));

const input = document.getElementById('latexInput');
const sendBtn = document.getElementById('sendBtn');
const getBtn = document.getElementById('getBtn');
const clearBtn = document.getElementById('clearInputBtn');
const expressionSelector = document.getElementById('expressionSelector');
const statusIndicator = document.getElementById('statusIndicator');

// Insert Button Logic
document.querySelectorAll('[data-insert]').forEach(button => {
  button.addEventListener('click', () => {
    const insertText = JSON.parse('"' + button.getAttribute("data-insert") + '"');
    const start = input.selectionStart;
    const end = input.selectionEnd;
    const before = input.value.substring(0, start);
    const after = input.value.substring(end);
    input.value = before + insertText + after;
    input.selectionStart = input.selectionEnd = start + insertText.length;
    input.focus();
  });
});

sendBtn.addEventListener('click', () => {
  const selectedId = expressionSelector.value;
  if (!selectedId) {
    alert('Please select a line to update.');
    return;
  }

  calculator.setExpression({ id: selectedId, latex: input.value });
});

getBtn.addEventListener('click', () => {
  const selectedId = expressionSelector.value;
  if (!selectedId) {
    alert('Please select a line.');
    return;
  }

  const expressions = calculator.getExpressions();
  const match = expressions.find(expr => expr.id === selectedId);
  if (match && match.latex !== undefined) {
    input.value = match.latex;
  } else {
    alert("No LaTeX expression found.");
  }
});

clearBtn.addEventListener('click', () => {
  input.value = '';
});

function updateExpressionSelector() {
  const expressions = calculator.getExpressions();
  expressionSelector.innerHTML = '';
  expressions.forEach(expr => {
    const option = document.createElement('option');
    option.value = expr.id;
    option.textContent = expr.id;
    expressionSelector.appendChild(option);
  });
  statusIndicator.textContent = expressions.length ? 'Expression selected.' : 'No expression selected.';
}

calculator.observeEvent('change', updateExpressionSelector);

// Local Save/Load
document.getElementById('saveBtn').addEventListener('click', () => {
  localStorage.setItem('desmos_state', JSON.stringify(calculator.getState()));
});

document.getElementById('loadBtn').addEventListener('click', () => {
  const state = localStorage.getItem('desmos_state');
  if (state) calculator.setState(JSON.parse(state));
});

// Export/Import
document.getElementById('exportBtn').addEventListener('click', () => {
  const blob = new Blob([JSON.stringify(calculator.getState())], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'desmos_export.json';
  a.click();
});

document.getElementById('importBtn').addEventListener('click', () => {
  document.getElementById('importFile').click();
});

document.getElementById('importFile').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (evt) => {
    calculator.setState(JSON.parse(evt.target.result));
  };
  reader.readAsText(file);
});

// Greek and Letter Tabs
const greekLetters = [
  'alpha','beta','gamma','delta','epsilon','zeta','eta','theta','iota','kappa','lambda',
  'mu','nu','xi','omicron','pi','rho','sigma','tau','upsilon','phi','chi','psi','omega'
];

function populateGreek() {
  const greekPanel = document.getElementById('greek');
  greekPanel.innerHTML = '';
  greekLetters.forEach(letter => {
    const btn = document.createElement('button');
    btn.textContent = '\\' + letter;
    btn.setAttribute('data-insert', '\\\\' + letter);
    greekPanel.appendChild(btn);
  });
}
populateGreek();

// Tab Switching
document.querySelectorAll('.tab-button').forEach(button => {
  button.addEventListener('click', () => {
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    const target = button.getAttribute('data-tab');
    document.getElementById(target).classList.add('active');
  });
});

// Load default tab
document.querySelector('.tab-button[data-tab="letters"]').click();
