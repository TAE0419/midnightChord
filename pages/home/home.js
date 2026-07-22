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

function albumTile(album, framed = false) {
  const body = `
    ${assetBox(album, "rounded-2xl aspect-square w-full", album.icon || "")}
    <p class="mt-2 font-medium">${album.title}</p>
    <p class="text-sm" style="color:var(--muted)">${album.artist}${album.year ? ` · ${album.year}` : ""}</p>
  `;
  return framed ? `<article class="surface rounded-2xl p-3">${body}</article>` : `<article>${body}</article>`;
}

function trackRow(track, index, options = {}) {
  const sourceIndex = tracks.findIndex(item => item.title === track.title && item.artist === track.artist);
  const trackIndex = sourceIndex >= 0 ? sourceIndex : index;
  const art = options.art ? `<div class="${options.art} rounded-lg aspect-square"></div>` : `<span>${index + 1}</span>`;
  const grid = options.art ? "grid-cols-[44px_1fr_auto]" : "grid-cols-[30px_1fr_auto]";
  return `
    <button type="button" class="track-row grid ${grid} gap-3 p-4 items-center text-left w-full ${options.active ? "purple-soft" : ""}" data-track-index="${trackIndex}">
      ${art}
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
    <div class="surface rounded-3xl p-5 md:p-7 grid md:grid-cols-[1.2fr_.8fr] gap-6 items-center overflow-hidden">
      <div>
        <span class="viz-badge">Featured release</span>
        <h1 class="text-3xl md:text-4xl font-medium mt-4">오늘 밤<br>보라빛 음악 속으로</h1>
        <p class="mt-3 text-sm md:text-base" style="color:var(--muted)">새롭게 공개된 아티스트와 플레이리스트를 만나보세요.</p>
        <div class="flex gap-2 mt-5">
          <button type="button" class="purple-btn rounded-xl px-4 py-2" data-play-track="0">지금 재생</button>
          <button type="button" class="surface rounded-xl px-4 py-2" data-page-link="album">앨범 보기</button>
        </div>
      </div>
      <div class="album-art rounded-3xl aspect-square max-w-[270px] w-full mx-auto flex items-end p-5">
        <div>
          <p class="text-sm text-white/70">NEW ALBUM</p>
          <p class="text-xl font-medium">Purple Orbit</p>
          <p class="text-sm text-white/70">MUSE</p>
        </div>
      </div>
    </div>

    <div>
      <div class="flex justify-between items-center mb-3">
        <h2 class="font-medium text-lg">지금 인기 있는 앨범</h2>
        <button type="button" class="text-sm" style="color:#c4b5fd" data-page-link="browse">전체 보기</button>
      </div>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3">${albums.slice(0, 4).map(album => albumTile(album)).join("")}</div>
    </div>

    <div class="grid md:grid-cols-[1.2fr_.8fr] gap-4">
      <section class="surface rounded-2xl p-4">
        <div class="flex justify-between items-center mb-3">
          <div><p class="text-xs" style="color:var(--muted)">TOP TRACKS</p><h2 class="font-medium">실시간 인기 차트</h2></div>
          <span class="viz-badge">TOP 6</span>
        </div>
        <div>${tracks.map((track, index) => trackRow(track, index, { active: index === 0 })).join("")}</div>
      </section>
      <section class="surface rounded-2xl p-4">
        <h2 class="font-medium">오늘의 무드</h2>
        <p class="text-sm mt-1" style="color:var(--muted)">차분한 밤을 위한 추천</p>
        <div class="purple-soft rounded-2xl mt-4 p-4">
          <p class="text-xs">MIDNIGHT MIX</p>
          <p class="font-medium mt-1">Deep Purple Flow</p>
          <p class="text-sm mt-4">24 tracks · 1h 32m</p>
        </div>
      </section>
    </div>
  `;
}

window.trackitPages = window.trackitPages || {};
window.trackitPages.home = renderHome;
