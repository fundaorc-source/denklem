// DENKLEM ÇÖZÜCÜ - PROFESSIONAL MATH EDUCATION TOOL

// CLASS LEVEL EXAMPLES
const classExamples = {
  5: [
    { equation: 'x + 5 = 12', solution: 'x = 7' },
    { equation: 'x - 3 = 8', solution: 'x = 11' },
    { equation: '2 + x = 9', solution: 'x = 7' },
    { equation: 'x + 1 = 6', solution: 'x = 5' },
    { equation: 'x - 2 = 5', solution: 'x = 7' },
  ],
  6: [
    { equation: '2x = 10', solution: 'x = 5' },
    { equation: '3x = 12', solution: 'x = 4' },
    { equation: '2x + 3 = 11', solution: 'x = 4' },
    { equation: '3x - 2 = 7', solution: 'x = 3' },
    { equation: '4x + 1 = 9', solution: 'x = 2' },
  ],
  7: [
    { equation: '2x + 5 = 3x - 2', solution: 'x = 7' },
    { equation: '4x - 3 = 2x + 5', solution: 'x = 4' },
    { equation: '3(x + 2) = 15', solution: 'x = 3' },
    { equation: '2x + 4 = x + 7', solution: 'x = 3' },
    { equation: '5x - 10 = 2x + 8', solution: 'x = 6' },
  ],
  lgs: [
    { equation: '2x + 3 = 3(x - 1)', solution: 'x = 6' },
    { equation: '(x + 3)/2 = 5', solution: 'x = 7' },
    { equation: '3x - 2 = x + 6', solution: 'x = 4' },
    { equation: '2(2x - 1) = 3x + 4', solution: 'x = 6' },
    { equation: 'x/2 + 3 = 8', solution: 'x = 10' },
  ],
};

const tips = {
  5: 'Denklemin her iki tarafına aynı sayıyı ekle veya çıkar!',
  6: 'Denklemin her iki tarafını aynı sayıya böl veya çarp!',
  7: 'Bilinmeyenleri bir tarafa, sayıları diğer tarafa topla!',
  lgs: 'İşlem sırasını doğru takip et: Parantez → Çarpma/Bölme → Toplama/Çıkarma',
};

// STATE
let state = {
  equation: '',
  steps: [],
  currentStep: 0,
  solved: false,
  solution: null,
  solvedCount: 0,
};

let autoMode = false;

// DOM ELEMENTS
const classLevelSelect = document.getElementById('classLevel');
const themeToggle = document.getElementById('themeToggle');
const equationInput = document.getElementById('equationInput');
const solveBtn = document.getElementById('solveBtn');
const autoBtn = document.getElementById('autoBtn');
const examplesContainer = document.getElementById('examplesContainer');
const tipText = document.getElementById('tipText');
const progressFill = document.getElementById('progressFill');
const progressText = document.getElementById('progressText');
const stepsContainer = document.getElementById('stepsContainer');
const scaleLeft = document.getElementById('scaleLeft');
const scaleRight = document.getElementById('scaleRight');
const blocksDisplay = document.getElementById('blocksDisplay');
const numberLineDisplay = document.getElementById('numberLineDisplay');
const prevStepBtn = document.getElementById('prevStepBtn');
const nextStepBtn = document.getElementById('nextStepBtn');
const resetBtn = document.getElementById('resetBtn');
const resultSection = document.getElementById('resultSection');
const resultText = document.getElementById('resultText');
const downloadBtn = document.getElementById('downloadBtn');
const inputHint = document.getElementById('inputHint');
const tabs = document.querySelectorAll('.tab-btn');

// ===== EVENT LISTENERS =====
classLevelSelect.addEventListener('change', () => {
  loadExamples();
  updateTip();
  resetState();
});

themeToggle.addEventListener('click', toggleTheme);
solveBtn.addEventListener('click', solveEquation);
autoBtn.addEventListener('click', solveAuto);
prevStepBtn.addEventListener('click', previousStep);
nextStepBtn.addEventListener('click', nextStep);
resetBtn.addEventListener('click', () => resetState());
downloadBtn.addEventListener('click', downloadSolution);

equationInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') solveEquation();
});

tabs.forEach((tab) => {
  tab.addEventListener('click', () => switchTab(tab.dataset.tab));
});

// ===== INITIALIZATION =====
window.addEventListener('DOMContentLoaded', () => {
  loadExamples();
  updateTip();
  loadTheme();
});

// ===== FUNCTIONS =====

function loadExamples() {
  const classLevel = classLevelSelect.value;
  const examples = classExamples[classLevel];
  examplesContainer.innerHTML = '';

  examples.forEach((ex) => {
    const btn = document.createElement('button');
    btn.className = 'example-btn';
    btn.textContent = ex.equation;
    btn.addEventListener('click', () => {
      equationInput.value = ex.equation;
      equationInput.focus();
    });
    examplesContainer.appendChild(btn);
  });
}

function updateTip() {
  const classLevel = classLevelSelect.value;
  tipText.textContent = tips[classLevel];
}

function toggleTheme() {
  document.body.classList.toggle('dark-theme');
  localStorage.setItem('theme', document.body.classList.contains('dark-theme') ? 'dark' : 'light');
  themeToggle.querySelector('span').textContent = document.body.classList.contains('dark-theme') ? '☀️' : '🌙';
}

function loadTheme() {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
    document.body.classList.add('dark-theme');
    themeToggle.querySelector('span').textContent = '☀️';
  }
}

function solveEquation() {
  const equation = equationInput.value.trim();
  
  if (!equation) {
    inputHint.textContent = '❌ Lütfen bir denklem gir!';
    inputHint.style.color = '#ef4444';
    return;
  }

  const result = parseAndSolveEquation(equation);
  
  if (result.success) {
    state.equation = equation;
    state.steps = result.steps;
    state.solution = result.solution;
    state.currentStep = 0;
    state.solved = true;
    state.solvedCount++;
    
    updateProgress();
    displaySteps();
    updateVisualization();
    resultSection.style.display = 'block';
    resultText.textContent = `${result.variable} = ${result.solution}`;
    
    prevStepBtn.disabled = true;
    nextStepBtn.disabled = false;
    resetBtn.disabled = false;
    
    inputHint.textContent = '✅ Denklem çözüldü! Adımları aşağıdan inceleyebilirsin.';
    inputHint.style.color = '#10b981';
  } else {
    inputHint.textContent = '❌ ' + result.error;
    inputHint.style.color = '#ef4444';
    resultSection.style.display = 'none';
  }
}

function solveAuto() {
  const equation = equationInput.value.trim();
  
  if (!equation) {
    inputHint.textContent = '❌ Lütfen bir denklem gir!';
    inputHint.style.color = '#ef4444';
    return;
  }

  const result = parseAndSolveEquation(equation);
  
  if (result.success) {
    state.equation = equation;
    state.steps = result.steps;
    state.solution = result.solution;
    state.currentStep = 0;
    state.solved = true;
    state.solvedCount++;
    autoMode = true;
    
    updateProgress();
    displaySteps();
    updateVisualization();
    resultSection.style.display = 'block';
    resultText.textContent = `${result.variable} = ${result.solution}`;
    
    prevStepBtn.disabled = true;
    nextStepBtn.disabled = true;
    resetBtn.disabled = false;
    
    inputHint.textContent = '✅ Otomatik çözüm gösterildi!';
    inputHint.style.color = '#10b981';
    
    autoPlaySteps();
  } else {
    inputHint.textContent = '❌ ' + result.error;
    inputHint.style.color = '#ef4444';
    resultSection.style.display = 'none';
  }
}

function autoPlaySteps() {
  let stepIndex = 0;
  const interval = setInterval(() => {
    if (stepIndex < state.steps.length) {
      state.currentStep = stepIndex;
      displaySteps();
      updateVisualization();
      stepIndex++;
    } else {\n      clearInterval(interval);
      autoMode = false;
    }
  }, 2000);
}

function nextStep() {
  if (state.currentStep < state.steps.length - 1) {
    state.currentStep++;
    displaySteps();
    updateVisualization();
    
    if (state.currentStep === state.steps.length - 1) {
      nextStepBtn.disabled = true;
    }
    prevStepBtn.disabled = false;
  }
}

function previousStep() {
  if (state.currentStep > 0) {
    state.currentStep--;
    displaySteps();
    updateVisualization();
    
    if (state.currentStep === 0) {
      prevStepBtn.disabled = true;
    }
    nextStepBtn.disabled = false;
  }
}

function displaySteps() {
  stepsContainer.innerHTML = '';

  state.steps.forEach((step, index) => {
    const stepDiv = document.createElement('div');
    stepDiv.className = 'step';
    
    if (index <= state.currentStep) {
      stepDiv.classList.add('active');
    }
    if (index < state.currentStep) {
      stepDiv.classList.add('completed');
    }

    stepDiv.innerHTML = `
      <div class="step-title">Adım ${index + 1}: ${step.title}</div>
      <div class="step-description">${step.description}</div>
      <div class="step-equation">${step.equation}</div>
    `;

    stepsContainer.appendChild(stepDiv);
  });
}

function updateVisualization() {
  const currentEquation = state.steps[state.currentStep]?.equation || state.equation;
  visualizeScale(currentEquation);
  visualizeBlocks(currentEquation);
  visualizeNumberLine(currentEquation);
}

function visualizeScale(equation) {
  scaleLeft.innerHTML = '';
  scaleRight.innerHTML = '';

  const parts = equation.split('=');
  if (parts.length !== 2) return;

  const left = parseSide(parts[0].trim());
  const right = parseSide(parts[1].trim());

  left.forEach((item) => {
    scaleLeft.appendChild(createBlock(item.type, item.value));
  });

  right.forEach((item) => {
    scaleRight.appendChild(createBlock(item.type, item.value));
  });
}

function visualizeBlocks(equation) {
  blocksDisplay.innerHTML = '';
  const parts = equation.split('=');
  if (parts.length !== 2) return;

  const left = parts[0].trim();
  const right = parts[1].trim();

  const display = document.createElement('div');
  display.style.display = 'flex';
  display.style.gap = '1rem';
  display.style.alignItems = 'center';
  display.style.justifyContent = 'center';
  display.style.flexWrap = 'wrap';

  display.appendChild(renderEquationSide(left));
  
  const equalsSpan = document.createElement('span');
  equalsSpan.className = 'equals';
  equalsSpan.textContent = '=';
  display.appendChild(equalsSpan);
  
  display.appendChild(renderEquationSide(right));

  blocksDisplay.appendChild(display);
}

function renderEquationSide(side) {
  const container = document.createElement('div');
  container.style.display = 'flex';
  container.style.gap = '0.5rem';
  container.style.flexWrap = 'wrap';
  container.style.alignItems = 'center';
  container.style.justifyContent = 'center';

  const tokens = side.match(/[+\-]?\d*x|[+\-]?\d+|[+\-]/g) || [];
  
  tokens.forEach((token) => {
    if (token === '+' || token === '-') {
      const span = document.createElement('span');
      span.className = 'operator';
      span.textContent = token;
      container.appendChild(span);
    } else if (token.includes('x')) {
      const count = parseInt(token.replace('x', '') || '1');
      for (let i = 0; i < Math.abs(count); i++) {
        container.appendChild(createBlock('x', 1));
      }
    } else {
      const count = parseInt(token || '0');
      for (let i = 0; i < Math.abs(count); i++) {
        container.appendChild(createBlock('one', 1));
      }
    }
  });

  return container;
}

function visualizeNumberLine(equation) {
  numberLineDisplay.innerHTML = '';

  const match = equation.match(/x\s*=\s*([\d.-]+)/);
  if (!match) {
    numberLineDisplay.innerHTML = '<p>Henüz çözülmedi.</p>';
    return;
  }

  const solution = parseFloat(match[1]);
  const min = Math.floor(solution) - 5;
  const max = Math.floor(solution) + 5;

  const line = document.createElement('div');
  line.className = 'number-line-line';
  numberLineDisplay.appendChild(line);

  const marks = document.createElement('div');
  marks.className = 'number-line-marks';

  for (let i = min; i <= max; i++) {
    const mark = document.createElement('div');
    mark.className = 'number-line-mark';
    mark.textContent = i;
    
    if (i === Math.round(solution)) {
      mark.style.fontWeight = 'bold';
      mark.style.color = '#10b981';
      mark.style.fontSize = '1.1rem';
      mark.innerHTML = `<span style="color: #fbbf24; font-size: 1.5rem;">●</span><br>${i}`;
    }
    
    marks.appendChild(mark);
  }

  numberLineDisplay.appendChild(marks);
}

function createBlock(type, value) {
  const block = document.createElement('div');
  block.className = `block block-${type}`;
  block.textContent = type === 'x' ? 'x' : (type === 'one' ? '1' : '0');
  return block;
}

function parseSide(side) {
  const items = [];
  const tokens = side.match(/[+\-]?\d*x|[+\-]?\d+/g) || [];
  
  tokens.forEach((token) => {
    if (token.includes('x')) {
      const count = parseInt(token.replace('x', '') || '1');
      items.push({ type: 'x', value: Math.abs(count) });
    } else {
      const count = parseInt(token);
      for (let i = 0; i < Math.abs(count); i++) {
        items.push({ type: 'one', value: 1 });
      }
    }
  });
  
  return items;
}

function parseAndSolveEquation(equation) {
  try {
    equation = equation.replace(/\s+/g, '').toLowerCase();
    
    if (!equation.includes('=')) {
      return { success: false, error: 'Denklemde "=" işareti olmalı!' };
    }

    const [left, right] = equation.split('=');
    const variable = equation.match(/[a-z]/?.[0] || 'x';

    const steps = generateSolutionSteps(left, right, variable);
    const solution = solveLiner(left, right, variable);

    if (solution === null) {
      return { success: false, error: 'Bu denklemi çözemiyorum. Daha basit bir denklem dene!' };
    }

    return {
      success: true,
      equation,
      variable,
      steps,
      solution: parseFloat(solution).toFixed(2),
    };
  } catch (error) {
    return { success: false, error: 'Hata: Denklemi kontrol et!' };
  }
}

function solveLiner(left, right, variable) {
  try {
    for (let x = -1000; x <= 1000; x++) {
      const leftVal = evaluateExpression(left, variable, x);
      const rightVal = evaluateExpression(right, variable, x);
      if (Math.abs(leftVal - rightVal) < 0.001) {
        return x;
      }
    }
    return null;
  } catch {
    return null;
  }
}

function evaluateExpression(expr, variable, value) {
  try {
    let result = expr.replace(new RegExp(variable, 'g'), `(${value})`);
    result = result.replace(/(\d)\(/g, '$1*(');
    result = result.replace(/\)(\d)/g, ')*$1');
    result = result.replace(new RegExp(`\\(${variable}\\)`, 'g'), value);
    return Function('"use strict"; return (' + result + ')')();
  } catch {
    return NaN;
  }
}

function generateSolutionSteps(left, right, variable) {
  const steps = [];
  
  steps.push({
    title: 'Başlangıç',
    description: 'Verilen denklemi yazalım.',
    equation: `${left} = ${right}`,
  });

  steps.push({
    title: 'Denklemi Organize Et',
    description: 'Bilinmeyenleri bir tarafa, sabit sayıları diğer tarafa getirelim.',
    equation: `${left} = ${right}`,
  });

  steps.push({
    title: 'Çözümü Hesapla',
    description: 'Bilinmeyeni izole ederek sonuca ulaşalım.',
    equation: `${left} = ${right}`,
  });

  return steps;
}

function updateProgress() {
  const totalTarget = 10;
  const percentage = (state.solvedCount / totalTarget) * 100;
  progressFill.style.width = Math.min(percentage, 100) + '%';
  progressText.textContent = `${state.solvedCount} / ${totalTarget} Çözüldü`;
}

function switchTab(tabName) {
  document.querySelectorAll('.tab-content').forEach((tab) => {
    tab.classList.remove('active');
  });

  document.querySelectorAll('.tab-btn').forEach((btn) => {
    btn.classList.remove('active');
  });

  document.getElementById(tabName).classList.add('active');
  document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
}

function downloadSolution() {
  const content = `
╔═════════════════════════════════════════════════════════════════════════╗
║              DENKLEM ÇÖZÜMÜ - ORTAOKUL MATEMATIK         ║
╚═════════════════════════════════════════════════════════════════════════╝

📝 DENKLEMİ: ${state.equation}

✅ ÇÖZÜM: ${state.steps[state.steps.length - 1]?.equation}

───────────────────────────────────────────────────────────────────────────

📊 ADIMLAR:

───────────────────────────────────────────────────────────────────────────

${state.steps
  .map(
    (step, index) => `
ADIM ${index + 1}: ${step.title}
${step.description}
Denklem: ${step.equation}
`
  )
  .join('\n───────────────────────────────────────────────────────────────────────────\n')}

───────────────────────────────────────────────────────────────────────────

📌 NOT: Bu çözüm "Denklem" eğitsel aracı tarafından oluşturulmuştur.
   Lütfen her adımı dikkatle inceleyiniz.

⏰ Oluşturan Zaman: ${new Date().toLocaleString('tr-TR')}
  `.trim();

  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `denklem_cozumu_${Date.now()}.txt`;
  link.click();
}

function resetState() {
  state = {
    equation: '',
    steps: [],
    currentStep: 0,
    solved: false,
    solution: null,
    solvedCount: state.solvedCount,
  };

  equationInput.value = '';
  inputHint.textContent = '';
  stepsContainer.innerHTML = '<p class="placeholder">Bir denklem gir ve çözmek için butona tıkla</p>';
  resultSection.style.display = 'none';
  scaleLeft.innerHTML = '';
  scaleRight.innerHTML = '';
  blocksDisplay.innerHTML = '';
  numberLineDisplay.innerHTML = '';

  prevStepBtn.disabled = true;
  nextStepBtn.disabled = true;
  resetBtn.disabled = true;

  autoMode = false;
}