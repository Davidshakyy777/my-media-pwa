/* app.js — corrected: playlist items are buttons (no <a>), loadAndPlay handles playback & no new page open */

const audio = document.getElementById('audio');
const video = document.getElementById('video');

const audioTitle = document.getElementById('audioTitle');
const videoTitle = document.getElementById('videoTitle');

const audioListEl = document.getElementById('audioList');
const videoListEl = document.getElementById('videoList');

const installBtn = document.getElementById('installBtn');

let deferredPrompt = null;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  installBtn.hidden = false;
});

installBtn.addEventListener('click', async () => {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  const choice = await deferredPrompt.userChoice;
  deferredPrompt = null;
  installBtn.hidden = true;
});

/* Playlists — өзгертуге оңай */
const audioPlaylist = [
  {src: 'assets/audio/track-a-1.mp3', title: 'Аудио — Трек 1'},
  {src: 'assets/audio/track-a-2.mp3', title: 'Аудио — Трек 2'},
  {src: 'assets/audio/track-a-3.mp3', title: 'Аудио — Трек 3'}
];

const videoPlaylist = [
  {src: 'assets/video/clip-v-1.mp4', title: 'Видео — Клип 1'},
  {src: 'assets/video/clip-v-2.mp4', title: 'Видео — Клип 2'},
  {src: 'assets/video/clip-v-3.mp4', title: 'Видео — Клип 3'}
];

/* CREATE LISTS — use buttons so browser doesn't open files in a new tab */
function buildList(list, el, onClick) {
  el.innerHTML = '';
  list.forEach((item, i) => {
    const li = document.createElement('li');
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'track-btn';
    btn.textContent = item.title;
    btn.dataset.index = i;

    btn.addEventListener('click', (e) => {
      e.preventDefault(); // extra safety
      onClick(i);
    });

    li.appendChild(btn);
    el.appendChild(li);
  });
}

buildList(audioPlaylist, audioListEl, idx => loadAndPlay('audio', idx));
buildList(videoPlaylist, videoListEl, idx => loadAndPlay('video', idx));

/* state */
let aIndex = 0, vIndex = 0;
const aPlayBtn = document.getElementById('aPlay');
const aNextBtn = document.getElementById('aNext');
const aPrevBtn = document.getElementById('aPrev');

const vPlayBtn = document.getElementById('vPlay');
const vNextBtn = document.getElementById('vNext');
const vPrevBtn = document.getElementById('vPrev');

function updateActive(listEl, idx) {
  listEl.querySelectorAll('li').forEach((li, i) => {
    li.classList.toggle('active', i === idx);
  });
}

/* load & play controls */
function loadAndPlay(type, idx, autoplay = true) {
  if (type === 'audio') {
    aIndex = idx;
    audio.pause();
    audio.src = audioPlaylist[aIndex].src;
    audio.load();
    audioTitle.textContent = audioPlaylist[aIndex].title;
    updateActive(audioListEl, aIndex);
    if (autoplay) audio.play().catch(()=>{});
    aPlayBtn.textContent = audio.paused ? '▶️' : '⏸';
  } else {
    vIndex = idx;
    video.pause();
    video.src = videoPlaylist[vIndex].src;
    video.load();
    videoTitle.textContent = videoPlaylist[vIndex].title;
    updateActive(videoListEl, vIndex);
    if (autoplay) video.play().catch(()=>{});
    vPlayBtn.textContent = video.paused ? '▶️' : '⏸';
  }
}

/* initial load without autoplay to be browser-friendly */
audio.src = audioPlaylist[aIndex].src;
audioTitle.textContent = audioPlaylist[aIndex].title;
video.src = videoPlaylist[vIndex].src;
videoTitle.textContent = videoPlaylist[vIndex].title;
updateActive(audioListEl, aIndex);
updateActive(videoListEl, vIndex);

/* audio controls */
aPlayBtn.addEventListener('click', () => {
  if (audio.paused) { audio.play(); aPlayBtn.textContent = '⏸'; }
  else { audio.pause(); aPlayBtn.textContent = '▶️'; }
});
aNextBtn.addEventListener('click', () => {
  aIndex = (aIndex + 1) % audioPlaylist.length; loadAndPlay('audio', aIndex);
});
aPrevBtn.addEventListener('click', () => {
  aIndex = (aIndex - 1 + audioPlaylist.length) % audioPlaylist.length; loadAndPlay('audio', aIndex);
});
audio.addEventListener('ended', () => {
  aIndex = (aIndex + 1) % audioPlaylist.length; loadAndPlay('audio', aIndex);
});

/* video controls */
vPlayBtn.addEventListener('click', () => {
  if (video.paused) { video.play(); vPlayBtn.textContent = '⏸'; }
  else { video.pause(); vPlayBtn.textContent = '▶️'; }
});
vNextBtn.addEventListener('click', () => {
  vIndex = (vIndex + 1) % videoPlaylist.length; loadAndPlay('video', vIndex);
});
vPrevBtn.addEventListener('click', () => {
  vIndex = (vIndex - 1 + videoPlaylist.length) % videoPlaylist.length; loadAndPlay('video', vIndex);
});
video.addEventListener('ended', () => {
  vIndex = (vIndex + 1) % videoPlaylist.length; loadAndPlay('video', vIndex);
});

/* Optional: keyboard shortcuts (space play/pause for focused player) */
document.addEventListener('keydown', (e) => {
  if (e.code === 'Space') {
    const activeElem = document.activeElement;
    // if focus is in input/textarea, ignore
    if (activeElem && (activeElem.tagName === 'INPUT' || activeElem.tagName === 'TEXTAREA')) return;
    // toggle audio by default
    e.preventDefault();
    if (!audio.paused || !video.paused) {
      // if audio playing -> pause audio; else if video playing -> pause video
      if (!audio.paused) { audio.pause(); aPlayBtn.textContent = '▶️'; }
      else if (!video.paused) { video.pause(); vPlayBtn.textContent = '▶️'; }
      else { audio.play().catch(()=>{}); aPlayBtn.textContent = '⏸'; }
    } else {
      audio.play().catch(()=>{}); aPlayBtn.textContent = '⏸';
    }
  }
});
