/* 아티스트 상세 페이지 전용 렌더링 */
(() => {
  const artists = window.artistPageData.artists;
  const tracks = window.trackitData.tracks;

  function detailIcon(name, className = "w-4 h-4") {
    return `<i data-lucide="${name}" class="${className}"></i>`;
  }

  function detailArtistImage(artist) {
    const classes = "rounded-full aspect-square max-w-[150px] w-full mx-auto";
    if (artist.imageSrc) {
      return `<img src="${artist.imageSrc}" alt="${artist.name}" class="${classes} object-cover" onerror="this.replaceWith(Object.assign(document.createElement('div'), { className: '${classes} purple-soft flex items-center justify-center text-4xl', textContent: '${artist.initial}' }))">`;
    }
    return `<div class="${classes} purple-soft flex items-center justify-center text-4xl">${artist.initial}</div>`;
  }

  function detailTrackRow(track, index) {
    const sourceIndex = tracks.findIndex(item => item.title === track.title && item.artist === track.artist);
    const trackIndex = sourceIndex >= 0 ? sourceIndex : index;
    return `
      <button type="button" class="track-row grid grid-cols-[30px_1fr_auto] gap-3 p-4 items-center text-left w-full ${index === 0 ? "purple-soft" : ""}" data-track-index="${trackIndex}">
        <span>${index + 1}</span>
        <div class="min-w-0">
          <p class="truncate">${track.title}</p>
          <p class="text-sm truncate" style="color:var(--muted)">${track.artist}</p>
        </div>
        <span class="text-sm">${track.time}</span>
      </button>
    `;
  }

  function renderMyArtistDetail(artistName = "LUNA") {
    const artist = artists.find(item => item.name === artistName) || artists[0];
    return `
      <button type="button" class="text-sm flex items-center gap-2" style="color:#c4b5fd" data-page-link="artists">
        ${detailIcon("ArrowLeft")} 아티스트 목록
      </button>

      <div class="artist-detail-hero surface rounded-3xl p-5 md:p-7 grid md:grid-cols-[150px_1fr] gap-6 items-center">
        ${detailArtistImage(artist)}
        <div>
          <p class="text-sm" style="color:var(--muted)">ARTIST PROFILE</p>
          <h1 class="text-3xl md:text-4xl font-medium mt-2">${artist.name}</h1>
          <p class="mt-3 text-sm md:text-base" style="color:var(--muted)">${artist.des || `${artist.name}의 음악과 발매 소식을 소개하는 공간입니다.`}</p>
          <div class="flex gap-2 mt-5">
            <button type="button" class="artist-detail-play purple-btn" data-artist-detail-play="0">
              <span>인기곡재생</span>${detailIcon("Play")}
            </button>
            <button type="button" class="artist-follow surface rounded-xl px-4 py-2">팔로우</button>
          </div>
        </div>
      </div>

      <div class="artist-detail-lower grid md:grid-cols-[1.1fr_.9fr] gap-4">
        <section class="artist-tracks surface rounded-2xl p-4">
          <h2 class="font-medium mb-3">대표곡</h2>
          ${tracks.slice(0, 3).map(detailTrackRow).join("")}
        </section>
        <section class="artist-intro-card surface rounded-2xl" style='--artist-detail-image:url("${artist.imageSrc}")'>
          <div class="artist-intro-glass">
            <h2 class="font-medium">소개</h2>
            <p class="text-sm leading-6 mt-3">${artist.bio || "장르를 넘나드는 사운드와 선명한 분위기를 지닌 아티스트입니다."}</p>
          </div>
        </section>
      </div>
    `;
  }

  // 공용 렌더러 중 아티스트 상세만 개인 렌더러로 교체합니다.
  window.trackitPages.artistDetail = renderMyArtistDetail;
})();
