/*
 * 개인 아티스트 데이터 전용 검색 렌더러입니다.
 * 공용 trackit-pages.js를 수정하지 않고 검색 페이지에서만 사용합니다.
 */
(() => {
  const artists = window.artistPageData.artists;

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function searchArtistImage(artist) {
    const classes = "w-14 h-14 rounded-full object-cover shrink-0";
    if (artist.imageSrc) {
      return `<img src="${artist.imageSrc}" alt="${artist.name}" class="${classes}" onerror="this.replaceWith(Object.assign(document.createElement('div'), { className: 'w-14 h-14 rounded-full purple-soft flex items-center justify-center text-xl shrink-0', textContent: '${artist.initial}' }))">`;
    }
    return `<div class="w-14 h-14 rounded-full purple-soft flex items-center justify-center text-xl shrink-0">${artist.initial}</div>`;
  }

  function renderArtistSearch(query = "") {
    const keyword = query.trim().toLocaleLowerCase();
    const safeQuery = escapeHtml(query);
    const matchedArtists = keyword
      ? artists.filter(artist => {
          const searchableText = `${artist.name} ${artist.des || ""} ${artist.bio || ""}`.toLocaleLowerCase();
          return searchableText.includes(keyword);
        })
      : [];

    const resultContent = !keyword
      ? `<div class="surface rounded-2xl p-8 text-center" style="color:var(--muted)">아티스트 이름이나 소개를 검색해 보세요.</div>`
      : matchedArtists.length
        ? `<div class="grid md:grid-cols-2 gap-4">
            ${matchedArtists.map(artist => `
              <a class="surface rounded-2xl p-4 flex items-center gap-4 transition hover:border-violet-400" href="pages/artist-detail/?name=${encodeURIComponent(artist.name)}">
                ${searchArtistImage(artist)}
                <div class="min-w-0">
                  <p class="font-medium truncate">${artist.name}</p>
                  <p class="text-sm mt-1" style="color:var(--muted)">${artist.plays}</p>
                </div>
              </a>
            `).join("")}
          </div>`
        : `<div class="surface rounded-2xl p-8 text-center">“${safeQuery}”에 해당하는 아티스트가 없습니다.</div>`;

    return `
      <div>
        <p class="text-sm" style="color:var(--muted)">SEARCH</p>
        <h1 class="text-2xl font-medium mt-1">${keyword ? `“${safeQuery}” 아티스트 검색 결과` : "아티스트 검색"}</h1>
        ${keyword ? `<p class="text-sm mt-2" style="color:var(--muted)">${matchedArtists.length}명을 찾았습니다.</p>` : ""}
      </div>
      <div class="flex flex-wrap gap-2">
        <span class="purple-soft rounded-full px-4 py-2 text-sm">아티스트</span>
      </div>
      ${resultContent}
    `;
  }

  // 검색 페이지에서만 공용 검색 렌더러를 개인 아티스트 검색으로 교체합니다.
  window.trackitPages.search = renderArtistSearch;
})();
