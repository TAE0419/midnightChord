(function () {
  const filters = [
    { id: "all", label: "전체", icon: "LayoutGrid" },
    { id: "tracks", label: "곡", icon: "Music2" },
    { id: "albums", label: "앨범", icon: "Disc3" },
    { id: "artists", label: "아티스트", icon: "Mic2" },
    { id: "playlists", label: "플레이리스트", icon: "ListMusic" },
    { id: "podcasts", label: "팟캐스트", icon: "Podcast" }
  ];

  let activeFilter = "all";
  let lastQuery = "";

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function normalize(value) {
    return String(value ?? "").trim().toLocaleLowerCase("ko-KR");
  }

  function matches(item, fields, query) {
    if (!query) {
      return true;
    }

    return fields.some(field => normalize(item[field]).includes(query));
  }

  function icon(name, className = "w-4 h-4") {
    return `<i data-lucide="${name}" class="${className}" aria-hidden="true"></i>`;
  }

  function imageBox(src, alt, iconName, className = "") {
    const image = src
      ? `<img src="${escapeHtml(src)}" alt="${escapeHtml(alt)}" onerror="this.remove()">`
      : "";

    return `
      <span class="${className} flex items-center justify-center shrink-0">
        ${icon(iconName, "w-5 h-5")}
        ${image}
      </span>
    `;
  }

  function getSearchData(query) {
    const data = window.trackitData || {};
    const albums = Array.isArray(data.albums) ? data.albums : [];
    const tracks = Array.isArray(data.tracks) ? data.tracks : [];
    const artists = Array.isArray(data.artists) ? data.artists : [];
    const playlists = Array.isArray(data.playlists) ? data.playlists : [];
    const podcasts = Array.isArray(data.podcastSeries) ? data.podcastSeries : [];

    return {
      tracks: tracks
        .map((track, sourceIndex) => {
          const album = albums.find(item =>
            normalize(item.title) === normalize(track.title) ||
            (normalize(item.artist) === normalize(track.artist) && item.imageSrc)
          );

          return {
            ...track,
            sourceIndex,
            imageSrc: track.imageSrc || (album && album.imageSrc) || ""
          };
        })
        .filter(track => matches(track, ["title", "artist"], query)),
      albums: albums.filter(album => matches(album, ["title", "artist", "year"], query)),
      artists: artists.filter(artist => matches(artist, ["name", "des", "bio"], query)),
      playlists: playlists.filter(playlist => matches(playlist, ["title", "meta"], query)),
      podcasts: podcasts.filter(series => {
        if (matches(series, ["title", "host", "category", "description"], query)) {
          return true;
        }

        return Array.isArray(series.episodes) && series.episodes.some(episode =>
          matches(episode, ["title", "summary", "epNumber"], query)
        );
      })
    };
  }

  function renderTrack(track) {
    return `
      <button type="button"
        class="track-row search-track grid gap-3 p-4 items-center text-left w-full"
        data-track-index="${track.sourceIndex}"
        aria-label="${escapeHtml(track.title)} 재생">
        ${imageBox(track.imageSrc, `${track.title} 커버`, "Music2", "search-result-cover")}
        <span class="min-w-0">
          <span class="block truncate">${escapeHtml(track.title)}</span>
          <span class="block text-sm truncate" style="color:var(--muted)">${escapeHtml(track.artist)}</span>
        </span>
        <span class="flex items-center gap-2 text-sm" style="color:var(--muted)">
          <span class="hidden sm:inline">${escapeHtml(track.time || "")}</span>
          ${icon("Play", "w-4 h-4")}
        </span>
      </button>
    `;
  }

  function renderCard(item, type) {
    const card = {
      albums: {
        title: item.title,
        meta: `${item.artist}${item.year ? ` · ${item.year}` : ""}`,
        image: item.imageSrc,
        icon: "Disc3",
        action: 'data-page-link="album"',
        coverClass: ""
      },
      artists: {
        title: item.name,
        meta: item.plays || "아티스트",
        image: item.imageSrc,
        icon: "Mic2",
        action: `data-artist-name="${escapeHtml(item.name)}"`,
        coverClass: "is-artist"
      },
      playlists: {
        title: item.title,
        meta: item.meta || "플레이리스트",
        image: item.imageSrc,
        icon: item.icon || "ListMusic",
        action: 'data-page-link="playlist"',
        coverClass: ""
      },
      podcasts: {
        title: item.title,
        meta: `${item.host}${item.category ? ` · ${item.category}` : ""}`,
        image: item.coverImage,
        icon: "Podcast",
        action: 'data-page-link="podcasts"',
        coverClass: ""
      }
    }[type];

    return `
      <button type="button" class="search-card" ${card.action}>
        ${imageBox(card.image, card.title, card.icon, `search-card-cover ${card.coverClass}`)}
        <span class="min-w-0">
          <span class="block truncate font-medium">${escapeHtml(card.title)}</span>
          <span class="block truncate text-sm mt-1" style="color:var(--muted)">${escapeHtml(card.meta)}</span>
        </span>
        ${icon("ChevronRight", "w-4 h-4")}
      </button>
    `;
  }

  function renderSection(type, items, visibleLimit) {
    const filter = filters.find(item => item.id === type);
    const visibleItems = visibleLimit ? items.slice(0, visibleLimit) : items;
    const body = type === "tracks"
      ? visibleItems.map(renderTrack).join("")
      : `<div class="search-grid">${visibleItems.map(item => renderCard(item, type)).join("")}</div>`;

    return `
      <section class="search-section" aria-labelledby="search-${type}-title">
        <header class="search-section-header">
          <h2 id="search-${type}-title" class="search-section-title">
            ${icon(filter.icon, "w-4 h-4")}
            ${filter.label}
          </h2>
          <span class="search-section-count">${items.length}개${visibleLimit && items.length > visibleLimit ? ` 중 ${visibleItems.length}개 표시` : ""}</span>
        </header>
        ${body}
      </section>
    `;
  }

  function renderEmpty(query) {
    const message = query
      ? `<strong class="text-white">"${escapeHtml(lastQuery)}"</strong>에 맞는 콘텐츠가 없습니다.`
      : "이 분류에 표시할 콘텐츠가 없습니다.";

    return `
      <section class="search-empty" role="status">
        <div>
          <span class="search-empty-icon">${icon("SearchX", "w-5 h-5")}</span>
          <h2 class="font-medium mt-4">검색 결과가 없어요</h2>
          <p class="text-sm mt-2" style="color:var(--muted)">${message}</p>
          <p class="text-xs mt-1" style="color:var(--muted)">다른 제목이나 아티스트 이름으로 검색해 보세요.</p>
        </div>
      </section>
    `;
  }

  function renderSearch(query = "") {
    lastQuery = String(query).trim();
    const normalizedQuery = normalize(lastQuery);
    const results = getSearchData(normalizedQuery);
    const total = Object.values(results).reduce((sum, items) => sum + items.length, 0);
    const selectedResults = activeFilter === "all" ? total : results[activeFilter].length;

    const filterButtons = filters.map(filter => `
      <button type="button"
        class="search-filter ${activeFilter === filter.id ? "is-active" : ""}"
        data-search-filter="${filter.id}"
        aria-pressed="${activeFilter === filter.id}">
        ${filter.label}
        <span class="ml-1 text-xs">${filter.id === "all" ? total : results[filter.id].length}</span>
      </button>
    `).join("");

    let content = "";
    if (activeFilter === "all") {
      const limits = normalizedQuery
        ? { tracks: 6, albums: 4, artists: 4, playlists: 4, podcasts: 4 }
        : { tracks: 5, albums: 4, artists: 4, playlists: 3, podcasts: 4 };

      content = ["tracks", "albums", "artists", "playlists", "podcasts"]
        .filter(type => results[type].length)
        .map(type => renderSection(type, results[type], limits[type]))
        .join("");
    } else if (selectedResults) {
      content = renderSection(activeFilter, results[activeFilter]);
    }

    const heading = lastQuery ? `"${escapeHtml(lastQuery)}" 검색 결과` : "모든 콘텐츠 찾기";
    const summary = lastQuery
      ? `일치하는 콘텐츠 ${selectedResults}개`
      : `Studio Midnight의 콘텐츠 ${selectedResults}개`;

    return `
      <div class="search-page space-y-5">
        <header class="search-heading">
          <div class="min-w-0">
            <p class="search-eyebrow">SEARCH</p>
            <h1 class="text-2xl font-medium mt-1 break-words">${heading}</h1>
          </div>
          <p class="search-summary" aria-live="polite">${summary}</p>
        </header>
        <nav class="search-filters" aria-label="검색 결과 종류">
          ${filterButtons}
        </nav>
        <div class="space-y-4">
          ${content || renderEmpty(normalizedQuery)}
        </div>
      </div>
    `;
  }

  document.addEventListener("click", event => {
    const filterButton = event.target.closest("[data-search-filter]");
    if (!filterButton) {
      return;
    }

    activeFilter = filterButton.dataset.searchFilter;
    const pageRoot = document.querySelector("[data-page-root]");
    const searchInput = document.querySelector("[data-search-input]");

    if (pageRoot) {
      pageRoot.innerHTML = renderSearch(searchInput ? searchInput.value : lastQuery);
      if (window.lucide) {
        window.lucide.createIcons();
      }
    }
  });

  window.trackitPages = window.trackitPages || {};
  window.trackitPages.search = renderSearch;
})();
