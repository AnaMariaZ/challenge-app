let ch = JSON.parse(localStorage.getItem('ch') || '[]');
let hist = JSON.parse(localStorage.getItem('hist') || '{}');
let streak = JSON.parse(localStorage.getItem('streak') || '0');
let bestStreak = JSON.parse(localStorage.getItem('bestStreak') || '0');
let lastDay = localStorage.getItem('lastDay') || null;
let freeze = JSON.parse(localStorage.getItem('freeze') || '1');

function today() {
  let d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function save() {
  localStorage.setItem('ch', JSON.stringify(ch));
  localStorage.setItem('hist', JSON.stringify(hist));
  localStorage.setItem('streak', streak);
  localStorage.setItem('bestStreak', bestStreak);
  localStorage.setItem('lastDay', lastDay);
  localStorage.setItem('freeze', freeze);

  renderList();
  renderCal();
  renderStreak();
  renderProgress();
}

function addCh() {
  const input = document.getElementById("newCh");
  const text = input.value.trim();

  if (!text) return;

  ch.push(text);
  input.value = "";

  save();
}

function delCh(i) {
  ch.splice(i, 1);
  save();
}

function toggle(i, date) {
  if (!hist[date]) hist[date] = {};

  hist[date][i] = !hist[date][i];

  updateStreak(date);
  save();
}

function updateStreak(date) {
  let day = hist[date];
  let total = ch.length;
  let done = Object.values(day).filter(v => v).length;
  let pct = total ? done / total : 0;

  if (pct >= 0.8) {
    if (lastDay !== date) {
      streak++;
      lastDay = date;
      if (streak > bestStreak) bestStreak = streak;
    }
  } else {
    if (freeze > 0) {
      freeze--;
    } else {
      streak = 0;
      lastDay = null;
    }
  }
}

function renderList() {
  let ul = document.getElementById('list');
  ul.innerHTML = '';

  let d = today();

  ch.forEach((c, i) => {
    let checked = hist[d] && hist[d][i];

    let li = document.createElement('li');

    li.innerHTML = `
      <div class="row">
        <input type="checkbox" ${checked ? 'checked' : ''} onclick="toggle(${i}, '${d}')">
        <span class="text">${c}</span>
        <button class="del" onclick="delCh(${i})">Șterge</button>
      </div>
    `;

    ul.appendChild(li);
  });
}

function renderCal() {
  let cal = document.getElementById('calendar');
  cal.innerHTML = '';

  let now = new Date();
  let y = now.getFullYear();
  let m = now.getMonth();
  let t = today();

  let days = new Date(y, m + 1, 0).getDate();

  for (let d = 1; d <= days; d++) {
    let date = new Date(y, m, d);

    let key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

    let div = document.createElement('div');
    div.className = 'day';
    div.innerText = d;

    if (key === t) div.classList.add('today');

    if (hist[key]) {
      let total = ch.length;
      let done = Object.values(hist[key]).filter(v => v).length;
      let pct = total ? done / total : 0;

      if (pct >= 0.99) div.classList.add('green');
      else if (pct >= 0.8) div.classList.add('yellow');
      else if (pct >= 0.5) div.classList.add('orange');
      else div.classList.add('red');
    }

    div.onclick = () => showDay(key);
    cal.appendChild(div);
  }
}

function showDay(date) {
  let el = document.getElementById('dayDetails');
  el.innerHTML = `<h3>${date}</h3>`;

  ch.forEach((c, i) => {
    let done = hist[date] && hist[date][i];
    el.innerHTML += `<div>${done ? '✅' : '❌'} ${c}</div>`;
  });
}

function renderProgress() {
  let d = today();
  let day = hist[d];

  let bar = document.getElementById('progressBar');
  let txt = document.getElementById('progressText');

  if (!day || ch.length === 0) {
    bar.style.width = '0%';
    txt.innerText = '0% complet';
    return;
  }

  let total = ch.length;
  let done = Object.values(day).filter(v => v).length;

  if (done > total) done = total;

  let pct = Math.round((done / total) * 100);

  bar.style.width = pct + '%';
  txt.innerText = pct + '% complet';
}

window.onload = function () {
  renderList();
  renderCal();
  renderStreak();
  renderProgress();
};
