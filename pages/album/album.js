window.trackitPages = window.trackitPages || {};

const albumCoverImages = [
  "pages/album/albumimg/abum01.webp",
  "pages/album/albumimg/abum02.jpg",
  "pages/album/albumimg/abum03.webp",
  "pages/album/albumimg/abum04.webp",
  "pages/album/albumimg/abum05.webp",
  "pages/album/albumimg/abum06.jpeg",
  "pages/album/albumimg/abum07.webp",
  "pages/album/albumimg/abum08.jpg",
  "pages/album/albumimg/abum09.webp",
  "pages/album/albumimg/abum10.webp",
  "pages/album/albumimg/abum11.webp",
  "pages/album/albumimg/abum12.webp",
  "pages/album/albumimg/abum13.webp",
  "pages/album/albumimg/abum14.webp",
  "pages/album/albumimg/abum15.webp",
  "pages/album/albumimg/abum16.webp",
  "pages/album/albumimg/abum17.webp",
  "pages/album/albumimg/abum18.webp",
  "pages/album/albumimg/abum19.webp",
  "pages/album/albumimg/abum20.webp",
  "pages/album/albumimg/abum21.webp"
];

const albumCoverByTrack = {
  "classic-01": 4,
  "classic-02": 8,
  "classic-03": 17,
  "kpop-01": 1,
  "kpop-02": 11,
  "kpop-03": 18,
  "jpop-01": 2,
  "jpop-02": 5,
  "jpop-03": 15,
  "pop-01": 3,
  "pop-02": 19,
  "pop-03": 9,
  "indie-band-01": 10,
  "indie-band-02": 14,
  "indie-band-03": 16,
  "hiphop-rnb-01": 13,
  "hiphop-rnb-02": 20,
  "hiphop-rnb-03": 6,
  "hiphop-rnb-04": 12,
};

const albumTitleByTrack = {
  "classic-01": "Imperial Waltz Hall",
  "classic-02": "Velvet Chamber",
  "classic-03": "Cathedral Light",
  "kpop-01": "Neon Minute",
  "kpop-02": "After You Glow",
  "kpop-03": "No Rules Tonight",
  "jpop-01": "Night Train Letter",
  "jpop-02": "Tokyo Sidewalk",
  "jpop-03": "Soft Signal",
  "pop-01": "Skyline Crush",
  "pop-02": "Lucky Static",
  "pop-03": "Blue Hypnosis",
  "indie-band-01": "Crown Room Echo",
  "indie-band-02": "Small Hours",
  "indie-band-03": "Low Tide Diary",
  "hiphop-rnb-01": "Late Call",
  "hiphop-rnb-02": "Dice Season",
  "hiphop-rnb-03": "Chrome Engine",
  "hiphop-rnb-04": "Easy Mode"
};

const releaseDateByGenre = {
  classic: "2026.02.14",
  kpop: "2026.04.05",
  jpop: "2026.05.18",
  pop: "2026.06.02",
  indie: "2026.06.21",
  hiphop: "2026.07.09"
};

let albumTracks = Array.isArray(window.trackitData?.tracks) ? window.trackitData.tracks : [];
let selectedAlbumIndex = null;
let currentAlbumPage = 1;
const albumsPerPage = 8;

function encodeAlbumCoverPath(path) {
  return path.split("/").map(segment => encodeURIComponent(segment)).join("/");
}

function getAlbumGenreKey(track) {
  const id = track?.id || "";

  if (id.startsWith("hiphop-rnb")) return "hiphop";
  if (id.startsWith("indie-band")) return "indie";
  if (id.startsWith("classic")) return "classic";
  if (id.startsWith("kpop")) return "kpop";
  if (id.startsWith("jpop")) return "jpop";
  if (id.startsWith("pop")) return "pop";
  return "pop";
}

function formatGenre(track) {
  const key = getAlbumGenreKey(track);
  const labels = {
    classic: "CLASSIC",
    kpop: "K-POP",
    jpop: "J-POP",
    pop: "POP",
    indie: "INDIE / BAND",
    hiphop: "HIP-HOP / R&B"
  };
  return labels[key] || track.genre || "POP";
}

function getAlbumTitle(track) {
  return albumTitleByTrack[track?.id] || `${track?.artist || "Studio"} Single`;
}

function getAlbumReleaseDate(track) {
  return releaseDateByGenre[getAlbumGenreKey(track)] || "2026.07.23";
}

function getAlbumCover(track, index) {
  const coverIndex = albumCoverByTrack[track?.id] ?? index % albumCoverImages.length;
  return encodeAlbumCoverPath(albumCoverImages[coverIndex]);
}

function getSelectedAlbumFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const trackId = params.get("track");
  if (!trackId) return null;
  const foundIndex = albumTracks.findIndex(track => track.id === trackId);
  return foundIndex >= 0 ? foundIndex : null;
}

function getMixedAlbumIndexes() {
  const preferredOrder = [
    "pop-03",
    "hiphop-rnb-02",
    "classic-01",
    "jpop-02",
    "indie-band-01",
    "kpop-01",
    "pop-01",
    "classic-02",
    "hiphop-rnb-01",
    "jpop-01",
    "indie-band-02",
    "kpop-02",
    "pop-02",
    "classic-03",
    "hiphop-rnb-03",
    "jpop-03",
    "indie-band-03",
    "kpop-03",
    "hiphop-rnb-04"
  ];
  const used = new Set();
  const ordered = preferredOrder
    .map(id => albumTracks.findIndex(track => track.id === id))
    .filter(index => {
      if (index < 0 || used.has(index)) return false;
      used.add(index);
      return true;
    });

  albumTracks.forEach((_, index) => {
    if (!used.has(index)) ordered.push(index);
  });

  return ordered;
}

function albumCard(track, index) {
  const isActive = index === selectedAlbumIndex;
  return `
    <button type="button" class="single-album-card ${isActive ? "is-active" : ""}" data-album-index="${index}">
      <img src="${getAlbumCover(track, index)}" alt="${getAlbumTitle(track)} 앨범 표지" loading="lazy">
      <span>${formatGenre(track)}</span>
      <strong>${getAlbumTitle(track)}</strong>
      <small>${track.artist} · ${getAlbumReleaseDate(track)}</small>
    </button>
  `;
}

function renderAlbumPagination(totalPages) {
  if (totalPages <= 1) return "";

  return `
    <div class="album-pagination" aria-label="싱글 앨범 페이지">
      ${Array.from({ length: totalPages }, (_, index) => {
        const page = index + 1;
        return `<button type="button" class="${page === currentAlbumPage ? "is-active" : ""}" data-album-page="${page}" aria-label="${page}페이지" aria-current="${page === currentAlbumPage ? "page" : "false"}">${page}</button>`;
      }).join("")}
    </div>
  `;
}

function trackRow(track, index) {
  return `
    <button type="button" class="album-track-row" data-album-play="${index}">
      <span class="album-track-number">1</span>
      <div class="album-track-main">
        <strong>${track.title}</strong>
        <span>${track.artist}</span>
      </div>
      <span class="album-track-time">${track.time || "3:00"}</span>
    </button>
  `;
}

function renderAlbumDetail(track, index) {
  return `
    <section class="album-detail-hero">
      <div class="album-cover-frame">
        <img src="${getAlbumCover(track, index)}" alt="${getAlbumTitle(track)} 앨범 표지" class="album-cover-image">
      </div>
      <div class="album-detail-copy">
        <p class="album-kicker">싱글 앨범</p>
        <h1>${getAlbumTitle(track)}</h1>
        <p class="album-summary">${track.artist} · ${getAlbumReleaseDate(track)} · 1곡 · ${track.time || "3:00"}</p>
        <div class="album-meta-list">
          <span>장르 <strong>${formatGenre(track)}</strong></span>
          <span>앨범유형 <strong>Single</strong></span>
          <span>기획사 <strong>Midnight Chord</strong></span>
        </div>
        <div class="album-actions">
          <button type="button" class="purple-btn" data-album-play="${index}">${isAlbumTrackPlaying(index) ? "\uC815\uC9C0" : "\uC7AC\uC0DD"}</button>
          <a class="surface" href="${track.audioSrc}" download>다운로드</a>
        </div>
      </div>
      <section class="album-track-section">
        <div class="album-section-head">
          <div>
            <p>TRACK</p>
            <h2>수록곡 (1)</h2>
          </div>
        </div>
        <div class="album-track-head" aria-hidden="true">
          <span>#</span>
          <span>곡명</span>
          <span>시간</span>
        </div>
        <div class="album-track-list">${trackRow(track, index)}</div>
      </section>
    </section>
  `;
}

function renderAlbum() {
  if (!albumTracks.length) {
    return `<section class="surface rounded-2xl p-6">앨범으로 만들 곡 데이터가 없습니다.</section>`;
  }

  if (selectedAlbumIndex !== null) {
    selectedAlbumIndex = Math.min(selectedAlbumIndex, albumTracks.length - 1);
  }
  const selectedTrack = selectedAlbumIndex !== null ? albumTracks[selectedAlbumIndex] : null;
  const mixedAlbumIndexes = getMixedAlbumIndexes();
  const totalAlbumPages = Math.ceil(mixedAlbumIndexes.length / albumsPerPage);
  currentAlbumPage = Math.min(Math.max(currentAlbumPage, 1), totalAlbumPages);
  const pageStart = (currentAlbumPage - 1) * albumsPerPage;
  const visibleAlbumIndexes = mixedAlbumIndexes.slice(pageStart, pageStart + albumsPerPage);

  return `
    <div class="album-shell">
      ${selectedTrack ? renderAlbumDetail(selectedTrack, selectedAlbumIndex) : ""}
      <section class="album-library surface">
        <div class="album-section-head">
          <div>
            <p>SINGLES</p>
            <h2>싱글 앨범 ${albumTracks.length}개</h2>
          </div>
          <span>${currentAlbumPage} / ${totalAlbumPages}</span>
        </div>
        <div class="single-album-grid">${visibleAlbumIndexes.map(index => albumCard(albumTracks[index], index)).join("")}</div>
        ${renderAlbumPagination(totalAlbumPages)}
      </section>
    </div>
  `;
}

function renderAlbumPage() {
  const root = document.querySelector("[data-page-root]");
  if (!root || document.body.dataset.currentPage !== "album") return;
  root.innerHTML = renderAlbum();
  if (window.lucide) lucide.createIcons();
}

function getTrackAudioUrl(track) {
  return track?.audioSrc ? new URL(track.audioSrc, window.location.href).href : "";
}

function isAlbumTrackPlaying(index) {
  const audio = document.getElementById("studioAudio");
  const track = albumTracks[index];
  return Boolean(audio && track && audio.src === getTrackAudioUrl(track) && !audio.paused);
}

function setGlobalPlayerIcon(isPlaying) {
  [document.getElementById("playerToggle"), document.getElementById("mobilePlay")].forEach(button => {
    if (!button) return;
    const icon = isPlaying ? "Pause" : "Play";
    button.innerHTML = `<i data-lucide="${icon}" class="w-4 h-4"></i>`;
    button.setAttribute("aria-label", isPlaying ? "\uC815\uC9C0" : "\uC7AC\uC0DD");
  });
  if (window.lucide) lucide.createIcons();
}

function syncAlbumPlaybackUi() {
  const audio = document.getElementById("studioAudio");
  const isPlaying = Boolean(audio && !audio.paused);
  setGlobalPlayerIcon(isPlaying);

  document.querySelectorAll(".album-actions [data-album-play]").forEach(button => {
    const index = Number(button.dataset.albumPlay);
    button.textContent = isAlbumTrackPlaying(index) ? "\uC815\uC9C0" : "\uC7AC\uC0DD";
  });
}
function playAlbumTrack(index) {
  const audio = document.getElementById("studioAudio");
  const track = albumTracks[index];
  if (!audio || !track?.audioSrc) return;

  const nextSrc = getTrackAudioUrl(track);
  const isCurrentTrack = audio.src === nextSrc;

  if (isCurrentTrack && !audio.paused) {
    audio.pause();
    syncAlbumPlaybackUi();
    return;
  }

  if (!isCurrentTrack) {
    audio.src = track.audioSrc;
    audio.load();
  }

  const title = document.getElementById("playerTitle");
  const artist = document.getElementById("playerArtist");
  const status = document.getElementById("playerStatus");
  const cover = document.getElementById("playerCover");
  if (title) title.textContent = track.title;
  if (artist) artist.textContent = track.artist;
  if (status) status.textContent = `${getAlbumTitle(track)} \u00B7 ${track.time || "3:00"}`;
  if (cover) {
    cover.style.backgroundImage = `url("${getAlbumCover(track, index)}")`;
    cover.style.backgroundSize = "cover";
    cover.style.backgroundPosition = "center";
  }

  audio.play()
    .then(syncAlbumPlaybackUi)
    .catch(syncAlbumPlaybackUi);
}

function scrollAlbumToTop() {
  const root = document.querySelector("[data-page-root]");
  const main = document.querySelector(".trackit-app > main");

  if (main && main.scrollHeight > main.clientHeight) {
    main.scrollTo({ top: 0, behavior: "smooth" });
  }

  window.scrollTo({ top: 0, behavior: "smooth" });
  root?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function bindAlbumInteractions() {
  document.addEventListener("click", event => {
    if (document.body.dataset.currentPage !== "album") return;

    const card = event.target.closest("[data-album-index]");
    const pageButton = event.target.closest("[data-album-page]");
    const playButton = event.target.closest("[data-album-play]");

    if (playButton) {
      event.preventDefault();
      playAlbumTrack(Number(playButton.dataset.albumPlay));
      return;
    }

    if (pageButton) {
      event.preventDefault();
      currentAlbumPage = Number(pageButton.dataset.albumPage);
      renderAlbumPage();
      return;
    }

    if (card) {
      event.preventDefault();
      selectedAlbumIndex = Number(card.dataset.albumIndex);
      renderAlbumPage();
      requestAnimationFrame(scrollAlbumToTop);
    }
  });

  const audio = document.getElementById("studioAudio");
  audio?.addEventListener("play", syncAlbumPlaybackUi);
  audio?.addEventListener("pause", syncAlbumPlaybackUi);
  audio?.addEventListener("ended", syncAlbumPlaybackUi);
}

async function loadAlbumTracks() {
  try {
    const response = await fetch("data/audio-tracks.json");
    if (!response.ok) throw new Error("Unable to load album tracks.");
    const data = await response.json();
    albumTracks = Array.isArray(data) ? data : data.tracks || albumTracks;
    window.trackitData.tracks = albumTracks;
  } catch {
    albumTracks = Array.isArray(window.trackitData?.tracks) ? window.trackitData.tracks : [];
  }
  selectedAlbumIndex = getSelectedAlbumFromUrl();
  renderAlbumPage();
}

window.trackitPages.album = renderAlbum;

document.addEventListener("DOMContentLoaded", () => {
  if (document.body.dataset.currentPage !== "album") return;
  selectedAlbumIndex = getSelectedAlbumFromUrl();
  bindAlbumInteractions();
  loadAlbumTracks();
});
