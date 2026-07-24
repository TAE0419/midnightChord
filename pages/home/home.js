const { albums, tracks } = window.trackitData;

let homeAlbumCarouselIndex = 0;
let homeAlbumSourceTracks = [];
let homeAlbumCarouselLocked = false;

const homeAlbumCoverImages = [
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

const homeAlbumCoverByTrack = {
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
  "hiphop-rnb-04": 12
};

const homeAlbumTitleByTrack = {
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

const homePopularAlbumOrder = [
  "pop-03",
  "hiphop-rnb-02",
  "classic-01",
  "jpop-02",
  "indie-band-01",
  "kpop-01",
  "pop-01",
  "classic-02",
  "hiphop-rnb-01",
  "jpop-01"
];

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
  const playerTracks = window.trackitData.tracks || tracks;
  const safeIndex = playerTracks.length ? (index + playerTracks.length) % playerTracks.length : 0;
  const track = playerTracks[safeIndex] || playerTracks[0];
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

function bindHomeMoodBackground() {
  if (window.homeMoodBackgroundBound) {
    return;
  }

  window.homeMoodBackgroundBound = true;
  document.addEventListener("click", event => {
    const moodCard = event.target.closest("[data-mood-bg]");
    if (!moodCard || document.body.dataset.currentPage !== "home") {
      return;
    }

    const moodSection = moodCard.closest("[data-mood-section]");
    if (!moodSection) {
      return;
    }

    const nextBackground = `linear-gradient(180deg, rgba(17, 17, 21, .72), rgba(17, 17, 21, .82)), url("${moodCard.dataset.moodBg}")`;
    const overlay = document.createElement("div");
    overlay.className = "home-mood-bg-fade";
    overlay.style.backgroundImage = nextBackground;
    moodSection.appendChild(overlay);
    requestAnimationFrame(() => overlay.classList.add("is-visible"));
    window.setTimeout(() => {
      moodSection.style.backgroundImage = nextBackground;
      overlay.remove();
    }, 620);
    moodSection.style.backgroundSize = "cover";
    moodSection.style.backgroundPosition = "center";
    moodSection.querySelectorAll("[data-mood-bg]").forEach(card => {
      card.classList.toggle("is-active", card === moodCard);
    });
  });
}

function encodeHomeAlbumCoverPath(path) {
  return path.split("/").map(segment => encodeURIComponent(segment)).join("/");
}

function getHomeAlbumCover(track, index) {
  const coverIndex = homeAlbumCoverByTrack[track?.id] ?? index % homeAlbumCoverImages.length;
  return encodeHomeAlbumCoverPath(homeAlbumCoverImages[coverIndex]);
}

function getHomeAlbumTitle(track) {
  return homeAlbumTitleByTrack[track?.id] || track?.title || "Midnight Album";
}

function getHomePopularAlbums() {
  const albumTracks = homeAlbumSourceTracks.length ? homeAlbumSourceTracks : tracks;
  const used = new Set();
  const ranked = homePopularAlbumOrder
    .map(id => albumTracks.findIndex(track => track.id === id))
    .filter(index => {
      if (index < 0 || used.has(index)) return false;
      used.add(index);
      return true;
    })
    .map((trackIndex, rankIndex) => {
      const track = albumTracks[trackIndex];
      return {
        title: getHomeAlbumTitle(track),
        artist: track.artist,
        year: "2026",
        imageSrc: getHomeAlbumCover(track, trackIndex),
        rank: rankIndex + 1,
        trackId: track.id
      };
    });

  albums.forEach(album => {
    if (ranked.length < 10) {
      ranked.push({ ...album, rank: ranked.length + 1 });
    }
  });

  return ranked.slice(0, 10);
}

function getHomeAlbumVisibleCount() {
  const carousel = document.querySelector("[data-home-album-carousel]");
  const value = carousel ? window.getComputedStyle(carousel).getPropertyValue("--home-album-visible") : "5";
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : 5;
}

function getHomeAlbumStep(carousel) {
  const track = carousel?.querySelector("[data-home-album-track]");
  const firstCard = track?.firstElementChild;
  if (!carousel || !firstCard) {
    return 0;
  }

  const styles = window.getComputedStyle(track);
  const gap = Number.parseFloat(styles.columnGap || styles.gap || "0") || 0;
  return firstCard.getBoundingClientRect().width + gap;
}

function setHomeAlbumTrackItems(carousel, popularAlbums, startIndex, extraBefore = false, extraAfter = false) {
  const track = carousel?.querySelector("[data-home-album-track]");
  if (!track || !popularAlbums.length) return;

  const visibleCount = getHomeAlbumVisibleCount();
  const items = [];
  if (extraBefore) {
    items.push(popularAlbums[(startIndex - 1 + popularAlbums.length) % popularAlbums.length]);
  }

  for (let offset = 0; offset < visibleCount; offset += 1) {
    items.push(popularAlbums[(startIndex + offset) % popularAlbums.length]);
  }

  if (extraAfter) {
    items.push(popularAlbums[(startIndex + visibleCount) % popularAlbums.length]);
  }

  track.innerHTML = items.map(album => albumTile(album, false, album.rank)).join("");
}

function moveHomeAlbumCarousel(direction) {
  const popularAlbums = getHomePopularAlbums();
  const carousel = document.querySelector("[data-home-album-carousel]");
  const track = carousel?.querySelector("[data-home-album-track]");
  if (!popularAlbums.length || !carousel || !track || homeAlbumCarouselLocked) return;

  homeAlbumCarouselLocked = true;
  const normalizedDirection = direction > 0 ? 1 : -1;
  setHomeAlbumTrackItems(carousel, popularAlbums, homeAlbumCarouselIndex, normalizedDirection < 0, normalizedDirection > 0);

  const step = getHomeAlbumStep(carousel);
  track.classList.remove("is-sliding");
  track.style.transform = normalizedDirection < 0 ? `translateX(${-step}px)` : "translateX(0)";

  requestAnimationFrame(() => {
    track.classList.add("is-sliding");
    track.style.transform = normalizedDirection > 0 ? `translateX(${-step}px)` : "translateX(0)";
  });

  window.setTimeout(() => {
    homeAlbumCarouselIndex = (homeAlbumCarouselIndex + normalizedDirection + popularAlbums.length) % popularAlbums.length;
    carousel.dataset.carouselIndex = String(homeAlbumCarouselIndex);
    track.classList.remove("is-sliding");
    track.style.transform = "translateX(0)";
    setHomeAlbumTrackItems(carousel, popularAlbums, homeAlbumCarouselIndex);
    homeAlbumCarouselLocked = false;
  }, 360);
}

function bindHomeAlbumCarousel() {
  if (window.homeAlbumCarouselBound) {
    return;
  }

  window.homeAlbumCarouselBound = true;
  let dragStartX = 0;
  let dragLastX = 0;
  let isDragging = false;
  let didDragAlbumCarousel = false;

  document.addEventListener("click", event => {
    if (document.body.dataset.currentPage !== "home") return;
    const button = event.target.closest("[data-home-album-move]");
    const albumCard = event.target.closest("[data-home-album-track-id]");

    if (button) {
      event.preventDefault();
      event.stopPropagation();
      moveHomeAlbumCarousel(button.dataset.homeAlbumMove === "next" ? 1 : -1);
      return;
    }

    if (albumCard) {
      if (didDragAlbumCarousel) {
        event.preventDefault();
        event.stopPropagation();
        didDragAlbumCarousel = false;
      }
    }
  });

  document.addEventListener("wheel", event => {
    const carousel = event.target.closest("[data-home-album-carousel]");
    if (!carousel || document.body.dataset.currentPage !== "home") return;

    const primaryDelta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
    if (Math.abs(primaryDelta) < 10) return;

    event.preventDefault();
    moveHomeAlbumCarousel(primaryDelta > 0 ? 1 : -1);
  }, { passive: false });

  document.addEventListener("pointercancel", () => {
    const carousel = document.querySelector("[data-home-album-carousel]");
    const track = carousel?.querySelector("[data-home-album-track]");
    isDragging = false;
    carousel?.classList.remove("is-dragging");
    if (track) {
      track.classList.add("is-sliding");
      track.style.transform = "translateX(0)";
      window.setTimeout(() => track.classList.remove("is-sliding"), 180);
    }
  });

  document.addEventListener("pointerdown", event => {
    const carousel = event.target.closest("[data-home-album-carousel]");
    if (!carousel || document.body.dataset.currentPage !== "home" || homeAlbumCarouselLocked) return;
    dragStartX = event.clientX;
    dragLastX = event.clientX;
    isDragging = true;
    didDragAlbumCarousel = false;
    carousel.classList.add("is-dragging");
  });

  document.addEventListener("pointermove", event => {
    if (!isDragging || document.body.dataset.currentPage !== "home") return;
    const carousel = document.querySelector("[data-home-album-carousel]");
    const track = carousel?.querySelector("[data-home-album-track]");
    if (!carousel || !track) return;

    dragLastX = event.clientX;
    const distance = Math.max(Math.min(dragLastX - dragStartX, 120), -120);
    didDragAlbumCarousel = Math.abs(distance) > 8;
    track.style.transform = `translateX(${distance}px)`;
  });

  document.addEventListener("pointerup", event => {
    const carousel = event.target.closest("[data-home-album-carousel]") || document.querySelector("[data-home-album-carousel]");
    if (!isDragging || document.body.dataset.currentPage !== "home") return;
    isDragging = false;
    carousel?.classList.remove("is-dragging");
    const track = carousel?.querySelector("[data-home-album-track]");
    const distance = dragLastX - dragStartX;
    if (track) {
      track.classList.add("is-sliding");
      track.style.transform = "translateX(0)";
      window.setTimeout(() => track.classList.remove("is-sliding"), 180);
    }
    if (Math.abs(distance) < 42) return;
    window.setTimeout(() => moveHomeAlbumCarousel(distance < 0 ? 1 : -1), 0);
  });
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
      "img/img (1).jfif",
      "img/img (22).jfif",
      "img/img (45).jfif",
      "img/img (19).jfif",
      "img/img (28).jfif"
    ];

    if (!Array.isArray(loadedTracks)) {
      return;
    }

    homeAlbumSourceTracks = loadedTracks.filter(track => track && track.title && track.artist);

    const playableTracks = loadedTracks
      .filter(track => track && track.title && track.artist && track.audioSrc)
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
  const detailHref = album.trackId ? `pages/album/?track=${encodeURIComponent(album.trackId)}` : "pages/album/";
  const detailAttrs = album.trackId ? ` data-home-album-track-id="${album.trackId}"` : "";
  return framed ? `<a href="${detailHref}" class="surface rounded-2xl p-3 home-album-card"${detailAttrs}>${body}</a>` : `<a href="${detailHref}" class="home-album-card"${detailAttrs}>${body}</a>`;
}

function renderHomeAlbumCarouselItems(popularAlbums = getHomePopularAlbums()) {
  if (!popularAlbums.length) {
    return "";
  }

  return Array.from({ length: Math.min(getHomeAlbumVisibleCount(), popularAlbums.length) }, (_, offset) => {
    const album = popularAlbums[(homeAlbumCarouselIndex + offset) % popularAlbums.length];
    return albumTile(album, false, album.rank);
  }).join("");
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
        <span class="viz-badge release">Featured playlist</span>
        <h1 class="text-3xl md:text-4xl font-medium mt-4 title">Feel the purple wave</h1>
        <p class="mt-3 text-sm md:text-base titleSub" style="color:var(--muted)">새롭게 공개된 아티스트와 플레이리스트를 만나보세요.</p>
        <div class="flex gap-2 mt-5">
          <button type="button" class="purple-btn rounded-xl px-4 py-2 home-action-button" data-play-track="0">지금 재생</button>
          <button type="button" class="surface rounded-xl px-4 py-2 home-action-button" data-page-link="playlist">플레이리스트 보기</button>
        </div>
      </div>
      <button type="button" class="pliBox rounded-3xl aspect-square max-w-[270px] w-full flex items-end p-5 home-featured-album text-left" data-play-track="0" aria-label="Purple Wave 플레이리스트 재생">
        <div>
          <p class="text-sm text-white/70">NEW PLAYLIST</p>
          <p class="text-xl font-medium">Purple Wave</p>
          <p class="text-sm text-white/70">10 tracks</p>
        </div>
      </button>
    </div>

    <div>
      <div class="flex justify-between items-center mb-3">
        <h2 class="font-medium text-lg mintText">지금 인기 있는 앨범</h2>
        <div class="home-album-actions">
          <button type="button" class="home-album-arrow" data-home-album-move="prev" aria-label="이전 인기 앨범">${icon("ChevronLeft")}</button>
          <button type="button" class="home-album-arrow" data-home-album-move="next" aria-label="다음 인기 앨범">${icon("ChevronRight")}</button>
          <button type="button" class="text-sm home-link-button" style="color:#c4b5fd" data-page-link="album">전체 보기</button>
        </div>
      </div>
      <div class="home-album-carousel" data-home-album-carousel data-carousel-index="${homeAlbumCarouselIndex}">
        <div class="home-album-track" data-home-album-track>${renderHomeAlbumCarouselItems()}</div>
      </div>
    </div>

    <div class="grid md:grid-cols-[1.2fr_.8fr] gap-4">
      <section class="surface rounded-2xl p-4 home-hover-panel">
        <div class="flex justify-between items-center mb-3">
          <div><p class="text-xs" style="color:var(--muted)">TOP TRACKS</p><h2 class="font-medium">실시간 인기 차트</h2></div>
          <span class="viz-badge">TOP 10</span>
        </div>
        <div class='mintText'>${tracks.slice(0, 10).map((track, index) => trackRow(track, index, { active: index === 0 })).join("")}</div>
      </section>
      <section class="surface rounded-2xl p-4 home-hover-panel home-mood-section" data-mood-section>
        <h2 class="font-medium">오늘의 무드</h2>
        <p class="text-sm mt-1" style="color:var(--muted)">차분한 밤을 위한 추천</p>
        <div class="purple-soft rounded-2xl mt-4 p-4 home-mood-card" data-play-track="1" data-mood-bg="img/img (22).jfif">
          <p class="text-xs">MIDNIGHT MIX 26</p>
          <p class="font-medium mt-1">Deep Purple Flow</p>
          <p class="text-sm mt-4">24 tracks · 1h 32m</p>
        </div>
        <div class="purple-soft rounded-2xl mt-4 p-4 home-mood-card" data-play-track="2" data-mood-bg="img/img (45).jfif">
          <p class="text-xs">MIDNIGHT MIX 27</p>
          <p class="font-medium mt-1">Neon City</p>
          <p class="text-sm mt-4">12 tracks · 53m</p>
        </div>
        <div class="purple-soft rounded-2xl mt-4 p-4 home-mood-card" data-play-track="3" data-mood-bg="img/img (19).jfif">
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
bindHomeMoodBackground();
bindHomeAlbumCarousel();
loadHomeChartTracks();
document.addEventListener("DOMContentLoaded", () => {
  syncHomePlayerCover();
  waitForHomePlayer();
});
