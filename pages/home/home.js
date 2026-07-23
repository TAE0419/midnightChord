const { albums, tracks } = window.trackitData;

function icon(name, className = "w-4 h-4") {
  return `<i data-lucide="${name}" class="${className}"></i>`;
}

function assetBox(item, className, fallback = "") {
  if (item.imageSrc) {
    return `<img src="${item.imageSrc}" alt="${item.title || item.name}" class="${className} object-cover" onerror="this.replaceWith(Object.assign(document.createElement('div'), { className: '${className} ${item.art || 'purple-soft'} flex items-center justify-center text-4xl', textContent: '${fallback}' }))">`;
  }
  return `<div class="${className} ${item.art || 'purple-soft'} flex items-center justify-center text-4xl">${fallback}</div>`;
}

function setHomePlayerCover(index) {
  const cover = document.getElementById("playerCover");
  const safeIndex = tracks.length ? (index + tracks.length) % tracks.length : 0;
  const track = tracks[safeIndex] || tracks[0];
  const imageSrc = track && (track.imageSrc || track.coverImage);

  if (!cover || !track) {
    return;
  }

  cover.className = "album-art w-11 h-11 rounded-xl shrink-0";
  cover.style.backgroundImage = "";
  cover.style.backgroundSize = "";
  cover.style.backgroundPosition = "";

  if (imageSrc) {
    cover.style.backgroundImage = `url("${imageSrc}")`;
    cover.style.backgroundSize = "cover";
    cover.style.backgroundPosition = "center";
  }
}

function syncHomePlayerCover() {
  if (typeof window.playTrackByIndex !== "function" || window.playTrackByIndex.isHomeCoverSynced) {
    return;
  }

  const originalPlayTrackByIndex = window.playTrackByIndex;
  window.playTrackByIndex = function playTrackByIndexWithHomeCover(index) {
    originalPlayTrackByIndex(index);
    setTimeout(() => setHomePlayerCover(Number.isFinite(index) ? index : 0), 0);
  };
  window.playTrackByIndex.isHomeCoverSynced = true;
  setHomePlayerCover(0);
}

function waitForHomePlayer() {
  let attempts = 0;
  const timer = setInterval(() => {
    attempts += 1;
    syncHomePlayerCover();

    if (window.playTrackByIndex && window.playTrackByIndex.isHomeCoverSynced || attempts >= 40) {
      clearInterval(timer);
    }
  }, 50);
}

async function loadHomeChartTracks() {
  try {
    const [tracksResponse, imagesResponse] = await Promise.all([
      fetch("data/audio-tracks.json", { cache: "no-store" }),
      fetch("data/image-assets.json", { cache: "no-store" })
    ]);

    if (!tracksResponse.ok) {
      throw new Error(`Audio tracks request failed: ${tracksResponse.status}`);
    }

    const loadedTracks = await tracksResponse.json();
    const imageAssets = imagesResponse.ok ? await imagesResponse.json() : {};
    const covers = Array.isArray(imageAssets.covers) ? imageAssets.covers : [];
    const fallbackCovers = [
      "img/img (12).jfif",
      "img/img (54).jfif",
      "img/img (25).jfif",
      "img/img (36).jfif",
      "img/img (10).jfif",
      "img/img (1).jfif"
    ];

    if (!Array.isArray(loadedTracks)) {
      return;
    }

    const playableTracks = loadedTracks
      .filter(track => track && track.title && track.artist && track.audioSrc)
      .slice(0, 10)
      .map((track, index) => {
        const exactCover = covers.find(cover => cover.title === track.title && cover.artist === track.artist);
        const artistCover = covers.find(cover => cover.artist === track.artist);

        return {
          ...track,
          imageSrc: track.imageSrc || track.coverImage || (exactCover && exactCover.imageSrc) || (artistCover && artistCover.imageSrc) || fallbackCovers[index % fallbackCovers.length]
        };
      });

    if (playableTracks.length === 0) {
      return;
    }

    tracks.splice(0, tracks.length, ...playableTracks);
    setHomePlayerCover(0);

    const pageRoot = document.querySelector("[data-page-root]");
    if (pageRoot && document.body.dataset.currentPage === "home") {
      pageRoot.innerHTML = renderHome();
      if (window.lucide) {
        lucide.createIcons();
      }
    }
  } catch (error) {
    console.warn("Home chart JSON could not be loaded. Using bundled chart data.", error);
  }
}

function albumTile(album, framed = false, rank = null) {
  const body = `
    <div class="home-album-cover relative">
      ${rank ? `<span class="home-album-rank">${rank}</span>` : ""}
      ${assetBox(album, "rounded-2xl aspect-square w-full", album.icon || "")}
    </div>
    <p class="mt-2 font-medium">${album.title}</p>
    <p class="text-sm" style="color:var(--muted)">${album.artist}${album.year ? ` · ${album.year}` : ""}</p>
  `;
  return framed ? `<article class="surface rounded-2xl p-3 home-album-card">${body}</article>` : `<article class="home-album-card">${body}</article>`;
}

function trackRow(track, index, options = {}) {
  const sourceIndex = tracks.findIndex(item => {
    if (track.id && item.id) {
      return item.id === track.id;
    }
    return item.title === track.title && item.artist === track.artist;
  });
  const trackIndex = sourceIndex >= 0 ? sourceIndex : index;
  const rank = `<span class="chart-rank">${index + 1}</span>`;
  const visual = track.imageSrc || track.coverImage
    ? `<img src="${track.imageSrc || track.coverImage}" alt="${track.title} cover" class="rounded-lg aspect-square w-11 object-cover" onerror="this.replaceWith(Object.assign(document.createElement('div'), { className: 'album-art rounded-lg aspect-square w-11 flex items-center justify-center text-xs', textContent: '${index + 1}' }))">`
    : options.art
      ? `<div class="${options.art} rounded-lg aspect-square w-11 flex items-center justify-center text-xs">${index + 1}</div>`
      : `<span>${index + 1}</span>`;
  const grid = (track.imageSrc || track.coverImage || options.art) ? "grid-cols-[28px_44px_1fr_auto]" : "grid-cols-[30px_1fr_auto]";
  return `
    <button type="button" class="track-row grid ${grid} gap-3 p-4 items-center text-left w-full ${options.active ? "purple-soft" : ""}" data-track-index="${trackIndex}">
      ${(track.imageSrc || track.coverImage || options.art) ? rank : ""}
      ${visual}
      <div class="min-w-0">
        <p class="truncate">${track.title}</p>
        <p class="text-sm truncate" style="color:var(--muted)">${track.artist}</p>
      </div>
      <span class="text-sm">${options.trailing || track.time}</span>
    </button>
  `;
}

function renderHome() {
  return `
    <div class="surface rounded-3xl p-5 md:p-7 overflow-hidden topBox home-hover-panel">
      <div class='textBox'>
        <span class="viz-badge release">Featured release</span>
        <h1 class="text-3xl md:text-4xl font-medium mt-4 title">Feel the purple wave</h1>
        <p class="mt-3 text-sm md:text-base" style="color:var(--muted)">새롭게 공개된 아티스트와 플레이리스트를 만나보세요.</p>
        <div class="flex gap-2 mt-5">
          <button type="button" class="purple-btn rounded-xl px-4 py-2 home-action-button" data-play-track="0">지금 재생</button>
          <button type="button" class="surface rounded-xl px-4 py-2 home-action-button" data-page-link="playlist">플레이리스트 보기</button>
        </div>
      </div>
      <div class="album-art rounded-3xl aspect-square max-w-[270px] w-full flex items-end p-5 home-featured-album">
        <div>
          <p class="text-sm text-white/70">NEW ALBUM</p>
          <p class="text-xl font-medium">Purple Orbit</p>
          <p class="text-sm text-white/70">MUSE</p>
        </div>
      </div>
    </div>

    <div>
      <div class="flex justify-between items-center mb-3">
        <h2 class="font-medium text-lg mintText">지금 인기 있는 앨범</h2>
        <button type="button" class="text-sm home-link-button" style="color:#c4b5fd" data-page-link="album">전체 보기</button>
      </div>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3">${albums.slice(0, 4).map((album, index) => albumTile(album, false, index + 1)).join("")}</div>
    </div>

    <div class="grid md:grid-cols-[1.2fr_.8fr] gap-4">
      <section class="surface rounded-2xl p-4 home-hover-panel">
        <div class="flex justify-between items-center mb-3">
          <div><p class="text-xs" style="color:var(--muted)">TOP TRACKS</p><h2 class="font-medium">실시간 인기 차트</h2></div>
          <span class="viz-badge">TOP 10</span>
        </div>
        <div class='mintText'>${tracks.slice(0, 10).map((track, index) => trackRow(track, index, { active: index === 0 })).join("")}</div>
      </section>
      <section class="surface rounded-2xl p-4 home-hover-panel">
        <h2 class="font-medium">오늘의 무드</h2>
        <p class="text-sm mt-1" style="color:var(--muted)">차분한 밤을 위한 추천</p>
        <div class="purple-soft rounded-2xl mt-4 p-4 home-mood-card">
          <p class="text-xs">MIDNIGHT MIX 26</p>
          <p class="font-medium mt-1">Deep Purple Flow</p>
          <p class="text-sm mt-4">24 tracks · 1h 32m</p>
        </div>
        <div class="purple-soft rounded-2xl mt-4 p-4 home-mood-card">
          <p class="text-xs">MIDNIGHT MIX 27</p>
          <p class="font-medium mt-1">Neon City</p>
          <p class="text-sm mt-4">12 tracks · 53m</p>
        </div>
        <div class="purple-soft rounded-2xl mt-4 p-4 home-mood-card">
          <p class="text-xs">MIDNIGHT MIX 28</p>
          <p class="font-medium mt-1">A Rainy Night</p>
          <p class="text-sm mt-4">21 tracks · 1h 15m</p>
        </div>
      </section>
    </div>
  `;
}

window.trackitPages = window.trackitPages || {};
window.trackitPages.home = renderHome;
loadHomeChartTracks();
document.addEventListener("DOMContentLoaded", () => {
  syncHomePlayerCover();
  waitForHomePlayer();
});
