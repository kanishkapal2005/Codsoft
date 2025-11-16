const display = document.getElementById('display');
const historyPanel = document.getElementById('history-panel');
const historyList = document.getElementById('history-list');
const buttons = document.querySelectorAll('button');

let history = JSON.parse(localStorage.getItem('calcHistory')) || [];
let currentExpression = '';
let shouldResetDisplay = false;

buttons.forEach(btn => {
  btn.addEventListener('click', handleButtonClick);
});

document.addEventListener('keydown', handleKeyPress);

function handleButtonClick(e) {
  const key = e.target.dataset.key;

  if (!key) return;

  if (key === 'C') {
    clearDisplay();
  } else if (key === 'Del') {
    deleteLastChar();
  } else if (key === 'History') {
    toggleHistory();
  } else if (key === '=') {
    calculate();
  } else if (key === 'sqrt') {
    applySqrt();
  } else if (key === 'square') {
    applySquare();
  } else if (key === 'percent') {
    applyPercent();
  } else if (key === 'reciprocal') {
    applyReciprocal();
  } else if (['+', '-', '*', '/', '.'].includes(key)) {
    appendToDisplay(key);
  } else if (!isNaN(key)) {
    if (shouldResetDisplay) {
      display.value = '';
      shouldResetDisplay = false;
    }
    appendToDisplay(key);
  }
}

function handleKeyPress(e) {
  const key = e.key;

  if (key === 'Enter') {
    e.preventDefault();
    calculate();
  } else if (key === 'Backspace') {
    deleteLastChar();
  } else if (key === 'Escape') {
    clearDisplay();
  } else if (['+', '-', '*', '/', '.', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'].includes(key)) {
    e.preventDefault();
    if (shouldResetDisplay && !isNaN(key)) {
      display.value = '';
      shouldResetDisplay = false;
    }
    appendToDisplay(key);
  }
}

function appendToDisplay(input) {
  if (shouldResetDisplay && !['+', '-', '*', '/', '.'].includes(input)) {
    display.value = '';
    shouldResetDisplay = false;
  }
  display.value += input;
  currentExpression = display.value;
}

function clearDisplay() {
  display.value = '';
  currentExpression = '';
  shouldResetDisplay = false;
}

function deleteLastChar() {
  display.value = display.value.slice(0, -1);
  currentExpression = display.value;
}

function calculate() {
  try {
    if (!display.value) return;

    let expression = display.value
      .replace(/×/g, '*')
      .replace(/÷/g, '/')
      .replace(/−/g, '-');

    const result = Function('"use strict"; return (' + expression + ')')();

    if (!isFinite(result)) {
      display.value = 'Error';
      return;
    }

    const displayResult = Math.round(result * 100000000) / 100000000;
    addToHistory(`${display.value} = ${displayResult}`);
    display.value = displayResult;
    currentExpression = displayResult.toString();
    shouldResetDisplay = true;
  } catch (error) {
    display.value = 'Error';
    shouldResetDisplay = true;
  }
}

function applySqrt() {
  try {
    const value = parseFloat(display.value);
    if (isNaN(value) || value < 0) {
      display.value = 'Error';
      return;
    }
    const result = Math.sqrt(value);
    addToHistory(`√${value} = ${result}`);
    display.value = Math.round(result * 100000000) / 100000000;
    shouldResetDisplay = true;
  } catch {
    display.value = 'Error';
  }
}

function applySquare() {
  try {
    const value = parseFloat(display.value);
    if (isNaN(value)) {
      display.value = 'Error';
      return;
    }
    const result = value * value;
    addToHistory(`${value}² = ${result}`);
    display.value = Math.round(result * 100000000) / 100000000;
    shouldResetDisplay = true;
  } catch {
    display.value = 'Error';
  }
}

function applyPercent() {
  try {
    const value = parseFloat(display.value);
    if (isNaN(value)) {
      display.value = 'Error';
      return;
    }
    const result = value / 100;
    display.value = Math.round(result * 100000000) / 100000000;
    currentExpression = display.value;
  } catch {
    display.value = 'Error';
  }
}

function applyReciprocal() {
  try {
    const value = parseFloat(display.value);
    if (isNaN(value) || value === 0) {
      display.value = 'Error';
      return;
    }
    const result = 1 / value;
    addToHistory(`1/${value} = ${result}`);
    display.value = Math.round(result * 100000000) / 100000000;
    shouldResetDisplay = true;
  } catch {
    display.value = 'Error';
  }
}

function addToHistory(entry) {
  history.unshift({
    expression: entry,
    timestamp: new Date().toLocaleTimeString()
  });

  if (history.length > 10) {
    history.pop();
  }

  localStorage.setItem('calcHistory', JSON.stringify(history));
  updateHistoryDisplay();
}

function updateHistoryDisplay() {
  historyList.innerHTML = '';
  history.forEach(item => {
    const historyItem = document.createElement('div');
    historyItem.className = 'history-item';
    historyItem.innerHTML = `
      <div class="history-expression">${item.expression}</div>
      <div class="history-time">${item.timestamp}</div>
    `;
    historyItem.addEventListener('click', () => {
      const result = item.expression.split(' = ')[1];
      display.value = result;
      shouldResetDisplay = true;
    });
    historyList.appendChild(historyItem);
  });
}

function toggleHistory() {
  historyPanel.classList.toggle('hidden');
  updateHistoryDisplay();
}

updateHistoryDisplay();
