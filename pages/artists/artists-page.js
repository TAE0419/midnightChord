/* 아티스트 목록 페이지 전용 렌더링 */
(() => {
  const artists = window.artistPageData.artists;
  const tracks = window.trackitData.tracks;

  function artistIcon(name, className = "w-4 h-4") {
    return `<i data-lucide="${name}" class="${className}"></i>`;
  }

  function artistImage(artist) {
    const classes = "w-14 h-14 rounded-full";
    if (artist.imageSrc) {
      return `<img src="${artist.imageSrc}" alt="${artist.name}" class="${classes} object-cover" onerror="this.replaceWith(Object.assign(document.createElement('div'), { className: '${classes} purple-soft flex items-center justify-center text-4xl', textContent: '${artist.initial}' }))">`;
    }
    return `<div class="${classes} purple-soft flex items-center justify-center text-4xl">${artist.initial}</div>`;
  }

  function renderMyArtists() {
    return `
      <div>
        <p class="text-sm" style="color:var(--muted)">ARTISTS</p>
        <h1 class="text-2xl font-medium mt-1">아티스트</h1>
      </div>
      <div class="grid md:grid-cols-2 gap-4">
        ${artists.map((artist, index) => `
          <article class="artist-card surface rounded-2xl p-4 flex items-center gap-4">
            ${artistImage(artist)}
            <div class="artist-card-meta flex-1">
              <p class="font-medium">${artist.name}</p>
              <p class="text-sm" style="color:var(--muted)">${artist.plays}</p>
            </div>

            <!-- 아티스트 카드의 미니 음악 재생바 -->
            <button type="button" class="artist-mini-player" data-artist-play-track="${index % tracks.length}" aria-label="아티스트 음악 재생">
              <span class="artist-mini-line" aria-hidden="true">
                <svg class="artist-wave" viewBox="0 0 180 30" preserveAspectRatio="none">
                  <path d="M0 15 L180 15"></path>
                </svg>
              </span>
              <span class="artist-mini-play" aria-hidden="true">
                ${artistIcon("Play", "artist-mini-icon artist-mini-icon-play w-4 h-4")}
                ${artistIcon("Pause", "artist-mini-icon artist-mini-icon-pause w-4 h-4")}
              </span>
            </button>

            <button type="button" class="surface rounded-xl px-3 py-2 text-sm" data-artist-name="${artist.name}">소개 보기</button>
          </article>
        `).join("")}
      </div>
    `;
  }

  // 공용 렌더러 중 아티스트 목록만 개인 렌더러로 교체합니다.
  window.trackitPages.artists = renderMyArtists;
})();
