const browseGenreConfig = [
  { key: "classic", label: "CLASSIC", subLabel: "클래식", genres: ["클래식"] },
  { key: "kpop", label: "K-POP", subLabel: "케이팝", genres: ["케이팝"] },
  { key: "trot", label: "TROT", subLabel: "트로트", genres: ["트로트"] },
  { key: "jpop", label: "J-POP", subLabel: "제이팝", genres: ["제이팝"] },
  { key: "pop", label: "POP", subLabel: "팝", genres: ["팝"] },
  { key: "hiphop-rnb", label: "HIP-HOP / R&B", subLabel: "힙합 / 알앤비", genres: ["힙합", "R&B"] }
];

let browseTracks = window.trackitData?.tracks || [];
let selectedBrowseGenreKey = browseGenreConfig[0].key;

function getSelectedBrowseGenre() {
  return browseGenreConfig.find(genre => genre.key === selectedBrowseGenreKey) || browseGenreConfig[0];
}

function getBrowseTracksByGenre(genre) {
  return browseTracks.filter(track => genre.genres.includes(track.genre));
}

function renderBrowseGenres() {
  return browseGenreConfig.map((genre, index) => {
    const count = getBrowseTracksByGenre(genre).length;
    const activeClass = genre.key === selectedBrowseGenreKey ? "genre-card active" : "genre-card";
    const featuredClass = index === 0 ? "genre-card--featured" : "";

    return `
      <button type="button" data-genre-key="${genre.key}" class="${activeClass} ${featuredClass} rounded-2xl p-4 text-left">
        <p class="text-xs font-semibold" style="color:var(--muted)">${genre.subLabel}</p>
        <p class="text-2xl font-semibold mt-2">${genre.label}</p>
        <p class="text-sm mt-3" style="color:var(--muted)">${count}곡</p>
      </button>
    `;
  }).join("");
}

function renderBrowseTrackRows() {
  const selectedGenre = getSelectedBrowseGenre();
  const filteredTracks = getBrowseTracksByGenre(selectedGenre);

  if (!filteredTracks.length) {
    return `<div class="p-4 text-sm" style="color:var(--muted)">표시할 곡이 없습니다.</div>`;
  }

  return filteredTracks.map(track => {
    const trackIndex = browseTracks.findIndex(item => item.id === track.id);

    return `
      <button type="button" class="browse-track-row" data-track-index="${trackIndex}">
        <div class="track-meta min-w-0">
          <p class="track-title truncate">${track.title}</p>
          <p class="track-subtitle text-sm truncate">${track.artist} · ${track.genre}</p>
        </div>
        <div class="track-time shrink-0">${track.time || track.duration || "-"}</div>
      </button>
    `;
  }).join("");
}

function renderBrowseTrackSection() {
  const selectedGenre = getSelectedBrowseGenre();

  return `
    <section class="browse-track-section rounded-2xl overflow-hidden">
      <div class="p-4 border-b" style="border-color:var(--border)">
        <p class="text-xs" style="color:var(--muted)">${selectedGenre.subLabel}</p>
        <h2 class="font-medium mt-1">${selectedGenre.label}</h2>
      </div>
      <div class="browse-track-list">${renderBrowseTrackRows()}</div>
    </section>
  `;
}

function bindBrowseGenreButtons() {
  const root = document.querySelector("[data-page-root]");
  if (!root) {
    return;
  }

  root.querySelectorAll("[data-genre-key]").forEach(button => {
    button.addEventListener("click", () => {
      selectedBrowseGenreKey = button.dataset.genreKey;
      renderBrowsePage();
    });
  });
}

function renderBrowse() {
  return `
    <div class="browse-shell">
      <div class="browse-hero surface rounded-3xl p-5 md:p-6">
        <p class="text-sm" style="color:var(--muted)">DISCOVER</p>
        <h1 class="font-medium mt-1">둘러보기</h1>
        <p class="text-sm mt-2" style="color:var(--muted)">장르별로 정리한 60곡 데이터로 구성한 탐색 페이지입니다.</p>
      </div>
      <div class="browse-genre-grid grid grid-cols-2 gap-3">${renderBrowseGenres()}</div>
      ${renderBrowseTrackSection()}
    </div>
  `;
}

function renderBrowsePage() {
  const root = document.querySelector("[data-page-root]");
  if (!root || document.body.dataset.currentPage !== "browse") {
    return;
  }

  root.innerHTML = renderBrowse();
  bindBrowseGenreButtons();

  if (window.lucide) {
    lucide.createIcons();
  }
}

async function loadBrowseTracks() {
  try {
    const response = await fetch("data/audio-tracks.json");
    if (!response.ok) {
      throw new Error("Unable to load browse tracks.");
    }

    const data = await response.json();
    browseTracks = Array.isArray(data) ? data : data.tracks || [];
    window.trackitData.tracks = browseTracks;
    renderBrowsePage();
  } catch {
    renderBrowsePage();
  }
}

window.trackitPages = {
  ...(window.trackitPages || {}),
  browse: renderBrowse
};

document.addEventListener("DOMContentLoaded", () => {
  bindBrowseGenreButtons();
  loadBrowseTracks();
});
