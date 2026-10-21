import { snapMood, moodDetails, localDateKey } from './mood.js';
import { readEntries, saveEntry } from './storage.js';
import { createShoreScene } from './scene.js';

const $ = id => document.getElementById(id);
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const scene = createShoreScene($('shore-canvas'), reducedMotion);
const screens = ['home', 'record-screen', 'saved-screen', 'history-screen'];
let introTimer, transitionTimer, toastTimer, transitioning = false;
let value = 0;

function updateDate() {
  const date = new Date();
  $('date').textContent = `${date.getFullYear()} / ${String(date.getMonth()+1).padStart(2,'0')} / ${String(date.getDate()).padStart(2,'0')}`;
  $('weekday').textContent = new Intl.DateTimeFormat('zh-CN', { weekday: 'long' }).format(date);
}
function toast(message) {
  clearTimeout(toastTimer);$('toast').textContent = message;$('toast').hidden = false;
  toastTimer = setTimeout(() => $('toast').hidden = true, 5000);
}
function entries() {
  try { return readEntries(); } catch { toast('暂时无法读取本机记录，请检查浏览器存储设置。');return []; }
}
function refreshToday() {
  updateDate();
  const today = entries().find(entry => entry.date === localDateKey());
  $('today-status').textContent = today ? `今天的${moodDetails(today.value).name}，已好好收着` : '留下一点，今天的自己';
  $('record').querySelector('span').textContent = today ? '再记一刻' : '记录';
}
function show(name) {
  screens.forEach(id => $(id).hidden = id !== name);
  $('app').dataset.screen = name;
  $('app-header').inert = false;
  if (name === 'home') refreshToday();
  const title = $(name).querySelector('h1');
  if (title) { title.tabIndex = -1;title.focus({ preventScroll: true }); }
}
function enter() {
  if (transitioning || $('intro').hidden) return;
  transitioning = true;clearTimeout(introTimer);
  $('intro').classList.add('dissolving');$('intro').inert = true;
  transitionTimer = setTimeout(() => {
    scene.stop();$('intro').hidden = true;transitioning = false;show('home');
  }, reducedMotion ? 650 : 3300);
}
function replay() {
  clearTimeout(introTimer);clearTimeout(transitionTimer);
  screens.forEach(id => $(id).hidden = true);
  $('app').dataset.screen = 'intro';$('app-header').inert = true;
  $('intro').hidden = false;$('intro').inert = false;
  $('intro').classList.remove('dissolving');transitioning = false;
  const progress = document.querySelector('.intro-progress i');
  progress.style.animation = 'none';void progress.offsetWidth;progress.style.animation = '';
  scene.start();introTimer = setTimeout(enter, 7500);
  $('enter').focus({ preventScroll: true });
}
function updateMood(next) {
  value = snapMood(next);
  const mood = moodDetails(value);
  $('mood').value = value;
  $('mood').setAttribute('aria-valuetext', `${mood.name}，${value === 0 ? '居中' : value < 0 ? '偏向失落' : '偏向喜悦'}`);
  $('mood-name').textContent = mood.name;
  $('mood-description').textContent = mood.description;
  document.querySelector('.slider-area').style.setProperty('--position', `${(value+100)/2}%`);
  $('mood-glow').style.background = `radial-gradient(ellipse, ${mood.color}55, transparent 68%)`;
}
function openRecord() {
  const today = entries().find(entry => entry.date === localDateKey());
  updateMood(today?.value ?? 0);$('note').value = today?.note ?? '';
  show('record-screen');
}
function openHistory() {
  const list = $('history-list');list.replaceChildren();
  const saved = entries();
  if (!saved.length) {
    const empty = document.createElement('div');empty.className = 'empty-state';
    const sun = document.createElement('div');sun.className = 'empty-sun';sun.textContent = '☼';
    const copy = document.createElement('p');copy.textContent = '这里，还没有留下心情。\n从今天的一点点感受开始吧。';copy.style.whiteSpace = 'pre-line';
    const button = document.createElement('button');button.className = 'text-button';button.textContent = '记录第一份心情 ↗';button.onclick = openRecord;
    empty.append(sun,copy,button);list.append(empty);
  }
  saved.forEach(entry => {
    const mood = moodDetails(entry.value);
    const item = document.createElement('article');item.className = 'history-entry';
    const top = document.createElement('div');top.className = 'entry-top';
    const label = document.createElement('span');label.className = 'entry-mood';
    const dot = document.createElement('i');dot.className = 'entry-dot';dot.style.setProperty('--mood-color', mood.color);
    label.append(dot,document.createTextNode(mood.name));
    const date = document.createElement('time');date.className = 'entry-date';date.dateTime = entry.date;date.textContent = entry.date === localDateKey() ? '今天' : entry.date.replaceAll('-', ' / ');
    top.append(label,date);item.append(top);
    if (entry.note) { const note = document.createElement('p');note.className = 'entry-note';note.textContent = entry.note;item.append(note); }
    const meter = document.createElement('div');meter.className = 'entry-meter';meter.setAttribute('aria-hidden','true');
    const marker = document.createElement('i');marker.style.left = `calc(${(entry.value+100)/2}% - 3px)`;meter.append(marker);item.append(meter);list.append(item);
  });
  show('history-screen');
}
$('enter').addEventListener('click', enter);
$('brand').addEventListener('click', () => show('home'));
$('record').addEventListener('click', openRecord);
$('record-back').addEventListener('click', () => show('home'));
$('history-back').addEventListener('click', () => show('home'));
$('done').addEventListener('click', () => show('home'));
$('replay').addEventListener('click', replay);
$('history').addEventListener('click', openHistory);
$('saved-history').addEventListener('click', openHistory);
$('mood').addEventListener('input', event => updateMood(event.target.value));
// Move across the magnetic center with keyboard controls as well as touch.
$('mood').addEventListener('keydown', event => {
  const direction = { ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1 }[event.key];
  if (direction) { event.preventDefault();updateMood(value + direction * 10); }
});
$('save').addEventListener('click', () => {
  const date = localDateKey();
  try {
    saveEntry({ date, value, note: $('note').value.trim(), updatedAt: new Date().toISOString() });
    $('saved-copy').textContent = `${moodDetails(value).name}，也是今天的一部分。`;
    $('saved-date').textContent = date.replaceAll('-', ' / ');
    show('saved-screen');
  } catch { toast('这次没有保存成功，请检查浏览器存储空间。你的文字还在，可以再试一次。'); }
});
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) {
    updateDate();
    if ($('app').dataset.screen === 'home') refreshToday();
  }
});
updateDate();scene.start();introTimer = setTimeout(enter, 7500);
