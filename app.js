'use strict';

const replies = {
  classic: [
    'Signs point to yes.',
    'Ask again later.',
    'Outlook not so good.',
    'Without a doubt.',
    'Cannot predict now.',
    'Better not tell you now.'
  ],
  oracle: [
    'The answer is hiding in the question.',
    'The probability is favorable. The consequences are interesting.',
    'A door will open. Check what is behind it.',
    'The future has declined to comment.',
    'Your intuition already submitted its answer.'
  ],
  matrix: [
    'There is no spoon. There is, however, a decision.',
    'You have mistaken the simulation for the question.',
    'Follow the anomaly.',
    'The choice was made before you arrived.',
    'Reality is buffering. Try again.'
  ],
  chaos: [
    'Consult a suspiciously wise raccoon.',
    'Absolutely. Unless it is Tuesday.',
    'The council of rubber ducks approves.',
    'Shake harder. The universe is lagging.',
    'Your destiny involves a spreadsheet and a goose.'
  ],
  stoic: [
    'Control your actions, not their outcome.',
    'The obstacle may be the way.',
    'You already possess the means to begin.',
    'Do not surrender your judgment to an oracle.',
    'Act with reason; accept uncertainty.'
  ],
  corporate: [
    'Let us circle back after a synergy audit.',
    'The roadmap is aligned with your aspirations.',
    'Please open a ticket with Destiny Operations.',
    'We should socialize this decision across stakeholders.',
    'The answer is pending executive sign-off.'
  ],
  cosmic: [
    'Something beyond the stars has noticed your inquiry.',
    'The silence between galaxies says no.',
    'Your question is older than your universe.',
    'The stars blinked. That was not an accident.',
    'Some answers should remain submerged.'
  ],
  reverse: [
    'What would you attempt if failure were harmless?',
    'What do you already know, but refuse to admit?',
    'If this choice were easy, what would you do?',
    'Who benefits from your hesitation?',
    'Which question frightens you more than this one?'
  ]
};

const orb = document.getElementById('orb');
const orbShell = document.getElementById('orbShell');
const surfaceRotator = document.getElementById('surfaceRotator');
const answer = document.getElementById('answer');
const history = document.getElementById('history');
const stability = document.getElementById('stability');
const question = document.getElementById('question');
const mode = document.getElementById('mode');
const shakeButton = document.getElementById('shake');
const shareButton = document.getElementById('share');
const resetButton = document.getElementById('reset');

let shakeCount = 0;
let lastAnswer = '';
let busy = false;
let entries = [];
let dragState = null;
let suppressNextClick = false;
let rotationX = 0;
let rotationY = 0;
let lastMotionShake = 0;

function randomIndex(max) {
  if (window.crypto && typeof window.crypto.getRandomValues === 'function') {
    const value = new Uint32Array(1);
    window.crypto.getRandomValues(value);
    return value[0] % max;
  }

  return Math.floor(Math.random() * max);
}

function renderRotation() {
  surfaceRotator.style.transform = `rotateX(${rotationX}deg) rotateY(${rotationY}deg)`;
}

function fitAnswer(text) {
  answer.classList.remove('medium', 'long');

  if (text.length > 58) {
    answer.classList.add('long');
  } else if (text.length > 38) {
    answer.classList.add('medium');
  }
}

function setAnswer(text) {
  fitAnswer(text);
  answer.textContent = text;
}

function renderHistory() {
  history.replaceChildren();

  if (entries.length === 0) {
    const emptyState = document.createElement('p');
    emptyState.className = 'empty-state';
    emptyState.textContent = 'The oracle has not yet spoken.';
    history.append(emptyState);
    return;
  }

  for (const entry of entries) {
    const item = document.createElement('div');
    item.className = 'entry';

    const prompt = document.createElement('span');
    prompt.textContent = `${entry.question} • ${entry.mode}`;

    const prophecy = document.createElement('strong');
    prophecy.textContent = entry.answer;

    item.append(prompt, prophecy);
    history.append(item);
  }
}

function shake() {
  if (busy) {
    return;
  }

  busy = true;
  shakeCount += 1;
  shakeButton.disabled = true;
  setAnswer('CONSULTING THE VOID…');

  orbShell.classList.remove('shaking');
  void orbShell.offsetWidth;
  orbShell.classList.add('shaking');

  window.setTimeout(() => {
    const options = replies[mode.value] || replies.oracle;
    lastAnswer = options[randomIndex(options.length)];
    setAnswer(lastAnswer);

    entries.unshift({
      question: question.value.trim() || 'An unspoken question',
      answer: lastAnswer,
      mode: mode.options[mode.selectedIndex].text
    });
    entries = entries.slice(0, 8);
    renderHistory();

    const score = Math.max(8, 100 - shakeCount * 9);
    stability.textContent = `REALITY STABILITY: ${score}%`;

    busy = false;
    shakeButton.disabled = false;
  }, 720);
}

function beginDrag(event) {
  if (event.button !== undefined && event.button !== 0) {
    return;
  }

  dragState = {
    pointerId: event.pointerId,
    x: event.clientX,
    y: event.clientY,
    moved: false
  };

  orb.classList.add('dragging');
  orb.setPointerCapture(event.pointerId);
  event.preventDefault();
}

function moveDrag(event) {
  if (!dragState || event.pointerId !== dragState.pointerId) {
    return;
  }

  const deltaX = event.clientX - dragState.x;
  const deltaY = event.clientY - dragState.y;

  if (Math.abs(deltaX) + Math.abs(deltaY) > 2) {
    dragState.moved = true;
  }

  rotationY += deltaX * 0.7;
  rotationX -= deltaY * 0.55;
  rotationX = Math.max(-68, Math.min(68, rotationX));

  dragState.x = event.clientX;
  dragState.y = event.clientY;
  renderRotation();
  event.preventDefault();
}

function endDrag(event) {
  if (!dragState || event.pointerId !== dragState.pointerId) {
    return;
  }

  suppressNextClick = dragState.moved;
  dragState = null;
  orb.classList.remove('dragging');

  if (orb.hasPointerCapture(event.pointerId)) {
    orb.releasePointerCapture(event.pointerId);
  }
}

orb.addEventListener('pointerdown', beginDrag);
orb.addEventListener('pointermove', moveDrag);
orb.addEventListener('pointerup', endDrag);
orb.addEventListener('pointercancel', endDrag);

orb.addEventListener('click', () => {
  if (suppressNextClick) {
    suppressNextClick = false;
    return;
  }

  shake();
});

orb.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    shake();
  }

  if (event.key === 'ArrowLeft') {
    rotationY -= 12;
    renderRotation();
  }

  if (event.key === 'ArrowRight') {
    rotationY += 12;
    renderRotation();
  }

  if (event.key === 'ArrowUp') {
    rotationX = Math.min(68, rotationX + 8);
    renderRotation();
  }

  if (event.key === 'ArrowDown') {
    rotationX = Math.max(-68, rotationX - 8);
    renderRotation();
  }
});

shakeButton.addEventListener('click', shake);

question.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    shake();
  }
});

resetButton.addEventListener('click', () => {
  shakeCount = 0;
  entries = [];
  lastAnswer = '';
  rotationX = 0;
  rotationY = 0;

  renderRotation();
  renderHistory();
  setAnswer('THE VOID AWAITS YOUR QUESTION');
  stability.textContent = 'REALITY STABILITY: 100%';
});

shareButton.addEventListener('click', async () => {
  if (!lastAnswer) {
    return;
  }

  const prompt = question.value.trim() || 'An unspoken question';
  const prophecy = `🎱 8.5 BALL\nQ: ${prompt}\nA: ${lastAnswer}`;

  try {
    await navigator.clipboard.writeText(prophecy);
    shareButton.textContent = 'COPIED!';
    window.setTimeout(() => {
      shareButton.textContent = 'COPY PROPHECY';
    }, 1400);
  } catch (error) {
    window.prompt('Copy your prophecy:', prophecy);
  }
});

window.addEventListener('devicemotion', (event) => {
  const acceleration = event.accelerationIncludingGravity;
  if (!acceleration) {
    return;
  }

  const magnitude = Math.hypot(
    acceleration.x || 0,
    acceleration.y || 0,
    acceleration.z || 0
  );

  const now = Date.now();
  if (magnitude > 24 && now - lastMotionShake > 1800) {
    lastMotionShake = now;
    shake();
  }
});

renderRotation();
renderHistory();
fitAnswer(answer.textContent);
