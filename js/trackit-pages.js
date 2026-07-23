const { albums, tracks, artists, playlists } = window.trackitData;

function icon(name, className = "w-4 h-4") {
  return `<i data-lucide="${name}" class="${className}"></i>`;
}

function assetBox(item, className, fallback = "") {
  if (item.imageSrc) {
    return `<img src="${item.imageSrc}" alt="${item.title || item.name}" draggable="false" class="${className} object-cover" onerror="this.replaceWith(Object.assign(document.createElement('div'), { className: '${className} ${item.art || 'purple-soft'} flex items-center justify-center text-4xl', textContent: '${fallback}' }))">`;
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

function playlistRecentRow(entry, index) {
  const art = entry.imageSrc
    ? assetBox(entry, "w-11 h-11 rounded-lg shrink-0", entry.initial || "")
    : `<div class="${entry.art || "purple-soft"} w-11 h-11 rounded-lg shrink-0"></div>`;
  return `
    <div class="flex items-center gap-3 p-3 border-b last:border-b-0" style="border-color:var(--border)">
      ${art}
      <div class="min-w-0 flex-1"><p class="truncate">${entry.title}</p><p class="text-sm truncate" style="color:var(--muted)">${entry.artist}</p></div>
      <div class="flex items-center gap-4 shrink-0"><button type="button" class="playlist-recent-delete" data-playlist-recent-delete="${index}">삭제</button><span class="text-sm">${entry.time}</span></div>
    </div>
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

function renderBrowse() {
  const genres = ["R&B", "Electronic", "Indie", "Lo-fi", "Pop", "Jazz"];
  return `
    <div><p class="text-sm" style="color:var(--muted)">DISCOVER</p><h1 class="text-2xl font-medium mt-1">둘러보기</h1></div>
    <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
      ${genres.map((genre, index) => `<div class="${index === 0 ? "purple-soft" : "surface"} rounded-2xl p-5 min-h-32"><p class="text-sm">Genre</p><p class="text-xl mt-2">${genre}</p></div>`).join("")}
    </div>
    <div>
      <h2 class="font-medium mb-3">신규 앨범</h2>
      <div class="grid grid-cols-2 md:grid-cols-3 gap-4">${albums.map(album => albumTile(album, true)).join("")}</div>
    </div>
  `;
}

function getAlbumCoverInfo(track) {
  const genre = (track.genre || "").toLowerCase();
  if (genre.includes("클래식")) {
    return {
      cover: "assets/images/covers/classic-masterpiece.svg",
      tag: "CLASSIC",
      type: "클래식 앨범",
      mood: "우아한 밤의 음악",
      description: "고전 관현악의 깊은 울림이 담긴 트랙입니다. 관악기와 현악기의 풍부한 텍스처가 밤의 감성을 촉촉하게 채웁니다."
    };
  }
  if (genre.includes("케이팝")) {
    return {
      cover: "assets/images/covers/kpop-color.svg",
      tag: "K-POP",
      type: "케이팝 싱글",
      mood: "빛나는 밤의 리듬",
      description: "경쾌한 비트와 선명한 멜로디가 돋보이는 트랙입니다. 화려한 사운드가 이어지는 밤을 연출합니다."
    };
  }
  if (genre.includes("제이팝")) {
    return {
      cover: "assets/images/covers/jpop-color.svg",
      tag: "J-POP",
      type: "제이팝 싱글",
      mood: "몽환적인 감성",
      description: "부드러운 선율과 반짝이는 사운드가 어우러진 곡입니다. 꿈결 같은 무드를 밤에 담아냅니다."
    };
  }
  if (genre.includes("힙합") || genre.includes("r&b")) {
    return {
      cover: "assets/images/covers/hiphop-color.svg",
      tag: "HIPHOP/R&B",
      type: "힙합/R&B 싱글",
      mood: "도시적인 밤의 무드",
      description: "무게감 있는 비트와 리듬이 돋보이는 트랙입니다. 도심 속 밤의 감성을 은은하게 채웁니다."
    };
  }
  if (genre.includes("인디") || genre.includes("밴드")) {
    return {
      cover: "assets/images/covers/indie-color.svg",
      tag: "INDIE",
      type: "인디/밴드 싱글",
      mood: "감성적인 여운",
      description: "어쿠스틱과 일렉트릭이 어우러진 매력적인 트랙입니다. 아늑한 밤의 감성으로 잔잔히 흐릅니다."
    };
  }
  if (genre.includes("electronic") || genre.includes("electronica")) {
    return {
      cover: "assets/images/covers/electronic-color.svg",
      tag: "ELECTRONIC",
      type: "일렉트로닉 싱글",
      mood: "미래적인 야간 감성",
      description: "신비로운 신스와 리듬이 어우러진 트랙입니다. 밤의 공기를 전자음으로 물들입니다."
    };
  }
  if (genre.includes("팝")) {
    return {
      cover: "assets/images/covers/pop-color.svg",
      tag: "POP",
      type: "팝 싱글",
      mood: "달빛 아래 감성",
      description: "세련된 멜로디와 감각적인 편곡이 돋보이는 트랙입니다. 밤의 공기를 가볍게 물들입니다."
    };
  }
  return {
    cover: "pages/album/album-cover.svg",
    tag: track.genre || "ALBUM",
    type: "싱글",
    mood: "다채로운 감성",
    description: "Studio Midnight이 큐레이션한 트랙입니다. 음악의 색감과 분위기를 담아낸 상세 페이지입니다."
  };
}

function renderAlbum() {
  const track = tracks[0];
  const coverInfo = getAlbumCoverInfo(track);

  return `
    <div class="grid gap-6 lg:grid-cols-[360px_1fr]">
      <section class="surface rounded-[28px] p-6 album-detail-card">
        <div class="relative overflow-hidden rounded-[28px] cover-card mb-6">
          <img id="albumCover" src="${coverInfo.cover}" alt="앨범 커버" class="w-full h-full object-cover" />
          <div id="albumCoverTag" class="cover-tag">${coverInfo.tag}</div>
        </div>
        <div class="space-y-3">
          <p class="text-sm" style="color:var(--muted)">앨범 상세</p>
          <h1 id="albumTitle" class="text-3xl font-semibold">${track.title}</h1>
          <p id="albumArtist" class="text-sm" style="color:var(--muted)">${track.artist} · ${track.genre} · 1곡</p>
          <div class="grid gap-3 mt-4">
            <div class="metric-card">
              <p class="text-xs uppercase tracking-[0.2em]" style="color:var(--muted)">트랙</p>
              <p id="detailTrackName" class="viz-stat-value text-xl">${track.title}</p>
            </div>
            <div class="metric-card">
              <p class="text-xs uppercase tracking-[0.2em]" style="color:var(--muted)">길이</p>
              <p id="detailTrackTime" class="viz-stat-value text-xl">${track.time}</p>
            </div>
          </div>
          <div class="flex flex-wrap gap-3 mt-5">
            <button id="detailPlay" type="button" class="purple-btn rounded-full px-5 py-3 font-medium" data-play-track="0">재생</button>
            <button id="detailNext" type="button" class="surface rounded-full px-5 py-3 font-medium">다음 트랙</button>
          </div>
        </div>
      </section>
      <section class="surface rounded-[28px] p-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-semibold">트랙 상세</h2>
          <span id="albumGenreTag" class="chip">${track.genre}</span>
        </div>
        <p id="trackDetailDescription" class="text-sm leading-7" style="color:#d4d4d8">${coverInfo.description}</p>
        <div class="mt-6 grid gap-3">
          <div class="metric-card">
            <p class="text-xs uppercase tracking-[0.2em]" style="color:var(--muted)">앨범 유형</p>
            <p id="albumType" class="viz-stat-value text-xl">${coverInfo.type}</p>
          </div>
          <div class="metric-card">
            <p class="text-xs uppercase tracking-[0.2em]" style="color:var(--muted)">추천 분위기</p>
            <p id="albumMoodDetail" class="viz-stat-value text-xl">${coverInfo.mood}</p>
          </div>
          <div class="metric-card">
            <p class="text-xs uppercase tracking-[0.2em]" style="color:var(--muted)">아티스트</p>
            <p id="albumArtistMeta" class="viz-stat-value text-xl">${track.artist}</p>
          </div>
        </div>
      </section>
    </div>
  `;
}

function renderArtists() {
  return `
    <div><p class="text-sm" style="color:var(--muted)">ARTISTS</p><h1 class="text-2xl font-medium mt-1">아티스트</h1></div>
    <div class="grid md:grid-cols-2 gap-4">
      ${artists.map(artist => `
        <article class="surface rounded-2xl p-4 flex items-center gap-4">
          ${assetBox(artist, "w-14 h-14 rounded-full", artist.initial)}
          <div class="flex-1"><p class="font-medium">${artist.name}</p><p class="text-sm" style="color:var(--muted)">${artist.plays}</p></div>
          <button type="button" class="surface rounded-xl px-3 py-2 text-sm" data-artist-name="${artist.name}">소개 보기</button>
        </article>
      `).join("")}
    </div>
  `;
}

function renderArtistDetail(artistName = "LUNA") {
  const artist = artists.find(item => item.name === artistName) || artists[0];
  return `
    <button type="button" class="text-sm flex items-center gap-2" style="color:#c4b5fd" data-page-link="artists">${icon("ArrowLeft")} 아티스트 목록</button>
    <div class="surface rounded-3xl p-5 md:p-7 grid md:grid-cols-[150px_1fr] gap-6 items-center">
      ${assetBox(artist, "rounded-full aspect-square max-w-[150px] w-full mx-auto", artist.initial)}
      <div>
        <p class="text-sm" style="color:var(--muted)">ARTIST PROFILE</p>
        <h1 class="text-3xl md:text-4xl font-medium mt-2">${artist.name}</h1>
        <p class="mt-3 text-sm md:text-base" style="color:var(--muted)">${artist.name}의 음악과 발매 소식을 소개하는 공간입니다. 보라빛 밤의 감성과 새로운 사운드를 만나보세요.</p>
        <div class="flex gap-2 mt-5"><button type="button" class="purple-btn rounded-xl px-4 py-2" data-play-track="0">${icon("Play")} 인기곡 재생</button><button type="button" class="surface rounded-xl px-4 py-2">팔로우</button></div>
      </div>
    </div>
    <div class="grid md:grid-cols-[1.1fr_.9fr] gap-4">
      <section class="surface rounded-2xl p-4"><h2 class="font-medium mb-3">대표곡</h2>${tracks.slice(0, 3).map((track, index) => trackRow(track, index, { active: index === 0 })).join("")}</section>
      <section class="surface rounded-2xl p-4"><h2 class="font-medium">소개</h2><p class="text-sm leading-6 mt-3" style="color:var(--muted)">장르를 넘나드는 사운드와 선명한 분위기를 지닌 아티스트입니다. 상세 콘텐츠는 이후 실제 소개 문구와 데이터 연동 단계에서 교체할 수 있습니다.</p></section>
    </div>
  `;
}

function renderPodcasts() {
  return `
    <div><p class="text-sm" style="color:var(--muted)">STUDIO VOICES</p><h1 class="text-2xl font-medium mt-1">팟캐스트</h1></div>
    <div class="surface rounded-3xl p-5 md:p-7 grid md:grid-cols-[1.2fr_.8fr] gap-6 items-center">
      <div><span class="viz-badge">NEW EPISODE</span><h2 class="text-2xl md:text-3xl font-medium mt-4">Midnight Session</h2><p class="text-sm mt-3" style="color:var(--muted)">음악을 만드는 사람들의 이야기와 새로운 사운드를 소개합니다.</p><button type="button" class="purple-btn rounded-xl px-4 py-2 mt-5" data-play-track="0">${icon("Play")} 에피소드 재생</button></div>
      <div class="album-art-dark rounded-3xl aspect-square max-w-[230px] w-full mx-auto flex items-center justify-center">${icon("Podcast", "w-14 h-14")}</div>
    </div>
    <section class="surface rounded-2xl overflow-hidden"><div class="p-4 flex justify-between items-center"><h2 class="font-medium">최근 에피소드</h2><span class="text-sm" style="color:var(--muted)">준비 중</span></div>${["밤의 작업실", "아티스트와 플레이리스트", "앨범이 완성되는 시간"].map((title, index) => trackRow({ title, artist: "Studio Midnight", time: `${18 + index * 6}:00` }, index, { active: index === 0 })).join("")}</section>
  `;
}

function renderPlaylist() {
  const carouselItems = Array.from({ length: 30 }, (_, index) => ({
    ...playlists[index % playlists.length],
    artist: artists[index % artists.length],
    artistIndex: index % artists.length
  }));
  window.setTimeout(() => window.trackitPlaylistCarousel?.(), 0);

  return `
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div><p class="text-sm" style="color:var(--muted)">MY LIBRARY</p><h1 class="text-2xl font-medium mt-1">플레이리스트</h1></div>
      <button type="button" class="playlist-create-button rounded-xl px-4 py-2" data-playlist-create>+ 새 플레이리스트</button>
    </div>
    <div class="playlist-carousel-shell">
      <button type="button" class="playlist-carousel-jump playlist-carousel-jump-start" data-playlist-carousel-start aria-label="처음으로 이동">${icon("ChevronsLeft", "w-5 h-5")}</button>
      <button type="button" class="playlist-carousel-jump playlist-carousel-jump-end" data-playlist-carousel-end aria-label="마지막으로 이동">${icon("ChevronsRight", "w-5 h-5")}</button>
      <div class="playlist-carousel" data-playlist-carousel>
      <div class="playlist-carousel-track" data-playlist-carousel-track>
      ${carouselItems.map((item, index) => {
        const artist = item.artist;
        return `
        <article class="playlist-carousel-card surface rounded-2xl p-3" data-playlist-card="${item.artistIndex}">
          ${assetBox({ ...item, imageSrc: artist?.imageSrc }, "rounded-xl aspect-square w-full")}
          <p class="font-medium mt-2">${artist?.name || item.title}</p>
          <p class="text-sm" style="color:var(--muted)">${artist?.title || item.meta}</p>
          <span class="playlist-card-selected" aria-hidden="true">선택됨</span>
          <input class="playlist-card-progress" data-playlist-progress="${item.artistIndex}" type="range" min="0" max="100" value="0" aria-label="재생 위치">
          <div class="playlist-card-controls" aria-label="${artist?.name || item.title} 재생 컨트롤">
            <button type="button" class="playlist-card-add" aria-label="내 라이브러리에 추가">+</button>
            <button type="button" data-playlist-action="previous" data-playlist-artist="${item.artistIndex}" aria-label="이전 곡">${icon("SkipBack", "w-4 h-4")}</button>
            <button type="button" class="playlist-card-play" data-playlist-action="play" data-playlist-artist="${item.artistIndex}" aria-label="재생">${icon("Play", "w-5 h-5")}</button>
            <button type="button" data-playlist-action="next" data-playlist-artist="${item.artistIndex}" aria-label="다음 곡">${icon("SkipForward", "w-4 h-4")}</button>
            <button type="button" data-playlist-action="shuffle" data-playlist-artist="${item.artistIndex}" aria-label="셔플">${icon("Shuffle", "w-4 h-4")}</button>
          </div>
        </article>
      `;
      }).join("")}
      </div>
      </div>
    </div>
    <div class="playlist-modal" data-playlist-modal hidden>
      <div class="playlist-modal-backdrop" data-playlist-modal-close></div>
      <section class="playlist-modal-dialog" role="dialog" aria-modal="true" aria-labelledby="playlist-modal-title">
        <div class="playlist-modal-header"><h2 id="playlist-modal-title">새 플레이리스트</h2><button type="button" class="playlist-modal-close" data-playlist-modal-close aria-label="닫기">×</button></div>
        <p class="playlist-modal-copy">플레이리스트에 담을 아티스트를 선택해 주세요.</p>
        <label class="playlist-modal-search"><span class="sr-only">아티스트 검색</span><input type="search" data-playlist-modal-search placeholder="아티스트 또는 곡 검색" autocomplete="off"></label>
        <div class="playlist-modal-artists" data-playlist-modal-artists>
          ${artists.map((artist, index) => `
            <button type="button" class="playlist-modal-artist ${index === 0 ? "is-selected" : ""}" data-playlist-modal-artist="${index}" data-playlist-modal-search-text="${artist.name} ${artist.title} ${artist.plays}">
              ${assetBox(artist, "w-11 h-11 rounded-full", artist.initial)}
              <span class="playlist-modal-artist-info"><strong>${artist.name}</strong><small>${artist.plays}</small></span>
              <span class="playlist-modal-intro" data-playlist-modal-detail="${encodeURIComponent(artist.name)}">소개 보기</span>
          </button>`).join("")}
          <p class="playlist-modal-empty" data-playlist-modal-empty hidden>검색 결과가 없습니다.</p>
        </div>
        <div class="playlist-modal-actions">
          <div class="playlist-modal-picker">
            <input class="playlist-modal-current-name" data-playlist-modal-current-name value="미드나잇플리" readonly aria-label="현재 플레이리스트 이름">
            <button type="button" class="playlist-modal-other-button" data-playlist-modal-other aria-expanded="false">다른 플리</button>
            <div class="playlist-modal-other-list" data-playlist-modal-other-list hidden>
              ${["새벽 산책", "Purple Focus", "주말 드라이브"].map(name => `<button type="button" data-playlist-modal-name="${name}">${name}</button>`).join("")}
            </div>
          </div>
          <button type="button" class="playlist-modal-confirm" data-playlist-modal-confirm>확인</button>
        </div>
      </section>
    </div>
    <div class="playlist-toast" data-playlist-toast role="status" aria-live="polite">플레이리스트에 추가 되었습니다.</div>
    <div class="surface rounded-2xl p-4">
      <h2 class="font-medium mb-3">최근 들은 곡</h2>
      <div data-playlist-recent-list></div>
    </div>
  `;
}

window.trackitPlaylistCarousel = function initializePlaylistCarousel() {
  const carousel = document.querySelector("[data-playlist-carousel]");
  const track = document.querySelector("[data-playlist-carousel-track]");
  if (!carousel || !track || carousel.dataset.playlistCarouselInitialized === "true") return;
  carousel.dataset.playlistCarouselInitialized = "true";
  const libraryKey = "studio-midnight-mypage-library";

  const createButton = document.querySelector("[data-playlist-create]");
  const modal = document.querySelector("[data-playlist-modal]");
  const toast = document.querySelector("[data-playlist-toast]");
  const startButton = document.querySelector("[data-playlist-carousel-start]");
  const endButton = document.querySelector("[data-playlist-carousel-end]");
  const recentList = document.querySelector("[data-playlist-recent-list]");
  const recentEntries = tracks.slice(0, 2).map((track, index) => ({
    ...track,
    imageSrc: artists[index]?.imageSrc,
    initial: artists[index]?.initial,
    art: albums[index]?.art,
    time: index === 0 ? "2분 전" : "18분 전"
  }));

  function currentPlaylistUser() {
    try {
      return JSON.parse(localStorage.getItem("studio-midnight-user"));
    } catch {
      return null;
    }
  }

  function artistTrack(artist) {
    const matched = tracks.find(item =>
      item.artist === artist.name ||
      artist.name.includes(item.artist) ||
      item.artist.includes(artist.name)
    );
    if (matched) return { ...matched };
    return {
      title: artist.title || `${artist.name} Sample`,
      artist: artist.name,
      time: artist.time || "--:--",
      audioSrc: artist.audio || ""
    };
  }

  function updateMypagePlaylist(name, selectedArtists) {
    const user = currentPlaylistUser();
    if (!user?.email) {
      alert("플레이리스트를 저장하려면 먼저 로그인해주세요.");
      window.location.href = new URL("pages/mypage/", document.baseURI).href;
      return false;
    }

    let libraries = {};
    try {
      libraries = JSON.parse(localStorage.getItem(libraryKey)) || {};
    } catch {
      libraries = {};
    }

    const userKey = user.email.toLowerCase();
    const library = libraries[userKey] && typeof libraries[userKey] === "object"
      ? libraries[userKey]
      : { follows: [], playlists: [], likes: [] };
    if (!Array.isArray(library.playlists)) library.playlists = [];

    const additions = selectedArtists.map(artistTrack);
    const playlist = library.playlists.find(item => item.title === name);
    if (playlist) {
      const uniqueTracks = new Map(
        [...(Array.isArray(playlist.tracks) ? playlist.tracks : []), ...additions]
          .map(item => [`${item.title}::${item.artist}`, item])
      );
      playlist.tracks = [...uniqueTracks.values()];
      playlist.count = playlist.tracks.length;
    } else {
      library.playlists.unshift({
        id: `playlist-${Date.now()}`,
        title: name,
        description: "플레이리스트 페이지에서 저장한 음악",
        icon: "ListMusic",
        tracks: additions,
        count: additions.length
      });
    }

    libraries[userKey] = library;
    localStorage.setItem(libraryKey, JSON.stringify(libraries));
    return true;
  }

  function renderRecentEntries() {
    if (!recentList) return;
    recentList.innerHTML = recentEntries.length
      ? recentEntries.map(playlistRecentRow).join("")
      : `<p class="text-sm p-3" style="color:var(--muted)">최근 들은 곡이 없습니다.</p>`;
  }

  function addRecentArtist(artist) {
    const title = artist.title || artist.name;
    const existingIndex = recentEntries.findIndex(entry => entry.artist === artist.name && entry.title === title);
    if (existingIndex >= 0) recentEntries.splice(existingIndex, 1);
    recentEntries.unshift({
      title,
      artist: artist.name,
      imageSrc: artist.imageSrc,
      initial: artist.initial,
      art: artist.art,
      time: "방금 전"
    });
    recentEntries.splice(5);
    renderRecentEntries();
  }

  renderRecentEntries();
  recentList?.addEventListener("click", event => {
    const deleteButton = event.target.closest("[data-playlist-recent-delete]");
    if (!deleteButton) return;
    recentEntries.splice(Number(deleteButton.dataset.playlistRecentDelete), 1);
    renderRecentEntries();
  });

  function setModalOpen(isOpen) {
    if (!modal) return;
    modal.hidden = !isOpen;
    document.body.classList.toggle("playlist-modal-open", isOpen);
    if (!isOpen) {
      modal.querySelector("[data-playlist-modal-other-list]").hidden = true;
      modal.querySelector("[data-playlist-modal-other]").setAttribute("aria-expanded", "false");
      const url = new URL(window.location.href);
      if (url.searchParams.get("modal") === "1") {
        url.searchParams.delete("modal");
        window.history.replaceState({}, "", url);
      }
    }
    if (isOpen) {
      const searchInput = modal.querySelector("[data-playlist-modal-search]");
      searchInput.value = "";
      modal.querySelectorAll("[data-playlist-modal-artist]").forEach(button => { button.hidden = false; });
      modal.querySelector("[data-playlist-modal-empty]").hidden = true;
      searchInput.focus();
    }
  }

  createButton?.addEventListener("click", () => setModalOpen(true));
  if (new URLSearchParams(window.location.search).get("modal") === "1") setModalOpen(true);
  function showPlaylistToast() {
    if (!toast) return;
    toast.classList.remove("is-visible");
    void toast.offsetWidth;
    toast.classList.add("is-visible");
    window.setTimeout(() => toast.classList.remove("is-visible"), 1500);
  }
  startButton?.addEventListener("click", () => carousel.scrollTo({ left: 0, behavior: "smooth" }));
  endButton?.addEventListener("click", () => carousel.scrollTo({ left: carousel.scrollWidth, behavior: "smooth" }));
  modal?.addEventListener("click", event => {
    if (event.target.closest("[data-playlist-modal-confirm]")) {
      const selectedArtists = [...modal.querySelectorAll("[data-playlist-modal-artist].is-selected")]
        .map(button => artists[Number(button.dataset.playlistModalArtist)])
        .filter(Boolean);
      if (!selectedArtists.length) {
        alert("플레이리스트에 담을 아티스트를 선택해주세요.");
        return;
      }
      const playlistName = modal.querySelector("[data-playlist-modal-current-name]").value.trim() || "미드나잇플리";
      if (!updateMypagePlaylist(playlistName, selectedArtists)) return;
      setModalOpen(false);
      showPlaylistToast();
      return;
    }
    if (event.target.closest("[data-playlist-modal-close]")) {
      setModalOpen(false);
      return;
    }
    const otherPlaylistButton = event.target.closest("[data-playlist-modal-other]");
    if (otherPlaylistButton) {
      const list = modal.querySelector("[data-playlist-modal-other-list]");
      const isOpen = list.hidden;
      list.hidden = !isOpen;
      otherPlaylistButton.setAttribute("aria-expanded", String(isOpen));
      return;
    }
    const playlistNameButton = event.target.closest("[data-playlist-modal-name]");
    if (playlistNameButton) {
      modal.querySelector("[data-playlist-modal-current-name]").value = playlistNameButton.dataset.playlistModalName;
      modal.querySelectorAll("[data-playlist-modal-name]").forEach(button => button.classList.toggle("is-selected", button === playlistNameButton));
      modal.querySelector("[data-playlist-modal-other-list]").hidden = true;
      modal.querySelector("[data-playlist-modal-other]").setAttribute("aria-expanded", "false");
      return;
    }
    const detailLink = event.target.closest("[data-playlist-modal-detail]");
    if (detailLink) {
      window.location.href = `pages/artist-detail/?name=${detailLink.dataset.playlistModalDetail}&returnTo=playlist`;
      return;
    }
    const artistButton = event.target.closest("[data-playlist-modal-artist]");
    if (!artistButton) return;
    artistButton.classList.toggle("is-selected");
  });
  modal?.querySelector("[data-playlist-modal-search]")?.addEventListener("input", event => {
    const query = event.target.value.trim().toLocaleLowerCase();
    let matches = 0;
    modal.querySelectorAll("[data-playlist-modal-artist]").forEach(button => {
      const isMatch = button.dataset.playlistModalSearchText.toLocaleLowerCase().includes(query);
      button.hidden = !isMatch;
      if (isMatch) matches += 1;
    });
    modal.querySelector("[data-playlist-modal-empty]").hidden = matches > 0;
  });
  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && !modal?.hidden) setModalOpen(false);
  });

  function updateCardPlayers() {
    const audio = document.getElementById("studioAudio");
    const artistIndex = Number(audio?.dataset.playlistArtistIndex);
    const percent = audio?.duration ? (audio.currentTime / audio.duration) * 100 : 0;
    document.querySelectorAll("[data-playlist-progress]").forEach(progress => {
      if (Number(progress.dataset.playlistProgress) === artistIndex) {
        progress.value = percent;
        progress.style.setProperty("--playlist-progress", `${percent}%`);
      }
    });
    document.querySelectorAll("[data-playlist-action='play']").forEach(button => {
      const active = !audio?.paused && Number(button.dataset.playlistArtist) === artistIndex;
      button.classList.toggle("is-playing", active);
      button.innerHTML = icon(active ? "Pause" : "Play", "w-5 h-5");
      button.setAttribute("aria-label", active ? "일시정지" : "재생");
    });
    if (window.lucide) window.lucide.createIcons();
  }

  function playArtist(index, forcePlay = false) {
    const artist = artists[index];
    const audio = document.getElementById("studioAudio");
    if (!artist?.audio || !audio) return;

    const isCurrentArtist = Number(audio.dataset.playlistArtistIndex) === index;
    if (isCurrentArtist && !audio.paused && !forcePlay) {
      audio.pause();
      updateCardPlayers();
      return;
    }

    if (!isCurrentArtist) {
      audio.src = artist.audio;
      audio.dataset.playlistArtistIndex = String(index);
      audio.load();
    } else if (audio.ended) {
      audio.currentTime = 0;
    }
    document.getElementById("playerTitle").textContent = artist.title || artist.name;
    document.getElementById("playerArtist").textContent = artist.name;
    document.getElementById("playerStatus").textContent = "재생 중";
    document.querySelector("[data-sidebar-player-title]").textContent = artist.title || artist.name;
    addRecentArtist(artist);
    audio.play().then(updateCardPlayers).catch(updateCardPlayers);
  }

  window.trackitPlaylistPlayArtist = playArtist;

  carousel.addEventListener("click", event => {
    const action = event.target.closest("[data-playlist-action]");
    const addButton = event.target.closest(".playlist-card-add");
    if (addButton) {
      const card = addButton.closest("[data-playlist-card]");
      const artist = artists[Number(card?.dataset.playlistCard)];
      if (!artist || !updateMypagePlaylist("미드나잇플리", [artist])) return;
      addButton.classList.add("is-added");
      showPlaylistToast();
      return;
    }
    if (!action) return;
    const index = Number(action.dataset.playlistArtist);
    if (action.dataset.playlistAction === "previous") playArtist((index - 1 + artists.length) % artists.length, true);
    if (action.dataset.playlistAction === "next") playArtist((index + 1) % artists.length, true);
    if (action.dataset.playlistAction === "shuffle") playArtist(Math.floor(Math.random() * artists.length), true);
    if (action.dataset.playlistAction === "play") playArtist(index);
  });

  carousel.addEventListener("click", event => {
    if (event.target.closest("button, input")) return;
    const card = event.target.closest("[data-playlist-card]");
    if (!card) return;
    const selectedIndex = card.dataset.playlistCard;
    track.querySelectorAll("[data-playlist-card]").forEach(item => {
      item.classList.toggle("is-selected", item.dataset.playlistCard === selectedIndex);
    });
  });

  carousel.addEventListener("input", event => {
    const progress = event.target.closest("[data-playlist-progress]");
    const audio = document.getElementById("studioAudio");
    if (!progress || !audio?.duration || Number(progress.dataset.playlistProgress) !== Number(audio.dataset.playlistArtistIndex)) return;
    progress.style.setProperty("--playlist-progress", `${progress.value}%`);
    audio.currentTime = (Number(progress.value) / 100) * audio.duration;
  });

  let dragStartX = 0;
  let dragStartScrollLeft = 0;
  let isDragging = false;

  carousel.addEventListener("pointerdown", event => {
    if (event.target.closest("button, input")) return;
    isDragging = true;
    carousel.classList.add("is-dragging");
    dragStartX = event.clientX;
    dragStartScrollLeft = carousel.scrollLeft;
    carousel.setPointerCapture(event.pointerId);
  });

  carousel.addEventListener("pointermove", event => {
    if (!isDragging) return;
    carousel.scrollLeft = dragStartScrollLeft - (event.clientX - dragStartX);
  });

  function finishDrag() {
    if (!isDragging) return;
    isDragging = false;
    carousel.classList.remove("is-dragging");
  }

  carousel.addEventListener("pointerup", finishDrag);
  carousel.addEventListener("pointercancel", finishDrag);
  carousel.addEventListener("wheel", event => {
    event.preventDefault();
    carousel.scrollBy({ left: event.deltaX || event.deltaY, behavior: "smooth" });
  }, { passive: false });

  const audio = document.getElementById("studioAudio");
  audio?.addEventListener("timeupdate", updateCardPlayers);
  audio?.addEventListener("play", updateCardPlayers);
  audio?.addEventListener("pause", updateCardPlayers);
};

function renderSearch(query = "") {
  const summary = query ? `"${query}" 검색 결과` : "검색 결과";
  return `
    <div><p class="text-sm" style="color:var(--muted)">SEARCH</p><h1 class="text-2xl font-medium mt-1">${summary}</h1></div>
    <div class="flex flex-wrap gap-2">${["전체", "곡", "앨범", "아티스트", "플레이리스트"].map((label, index) => `<button type="button" class="${index === 0 ? "purple-soft" : "chip"}">${label}</button>`).join("")}</div>
    <section class="surface rounded-2xl overflow-hidden">${tracks.slice(0, 5).map((track, index) => trackRow(track, index)).join("")}</section>
  `;
}

function renderMypage(user, error = "") {
  if (!user) {
    return `
      <div class="surface rounded-3xl p-5 md:p-7 max-w-xl mx-auto">
        <p class="text-sm" style="color:var(--muted)">LOCAL ACCOUNT</p>
        <h1 class="text-2xl font-medium mt-1">Studio Midnight 시작하기</h1>
        <p class="text-sm mt-3" style="color:var(--muted)">브라우저에만 저장되는 로컬 회원가입 데모입니다.</p>
        <form class="space-y-4 mt-6" data-signup-form novalidate>
          <label class="block text-sm">이름<input required minlength="2" name="name" autocomplete="name" class="w-full mt-2 rounded-xl border bg-transparent px-3 py-2" style="border-color:var(--border)" placeholder="이름을 입력하세요"></label>
          <label class="block text-sm">이메일<input required type="email" name="email" autocomplete="email" class="w-full mt-2 rounded-xl border bg-transparent px-3 py-2" style="border-color:var(--border)" placeholder="name@example.com"></label>
          <label class="block text-sm">비밀번호<input required type="password" name="password" minlength="6" autocomplete="new-password" class="w-full mt-2 rounded-xl border bg-transparent px-3 py-2" style="border-color:var(--border)" placeholder="6자 이상 입력"></label>
          <p class="form-error ${error ? "" : "hidden"}" data-form-error>${error}</p>
          <button type="submit" class="purple-btn rounded-xl px-4 py-2 w-full">로컬 회원가입</button>
        </form>
      </div>
    `;
  }
  return `
    <div class="surface rounded-3xl p-5 md:p-7 flex flex-col md:flex-row gap-5 md:items-center">
      <div class="w-24 h-24 rounded-full purple-soft flex items-center justify-center text-2xl">${user.name.slice(0, 1).toUpperCase()}</div>
      <div class="flex-1"><p class="text-sm" style="color:var(--muted)">LISTENER</p><h1 class="text-2xl font-medium mt-1">${user.name}</h1><p class="text-sm mt-2" style="color:var(--muted)">${user.email}</p></div>
      <button type="button" class="surface rounded-xl px-4 py-2" data-logout>로그아웃</button>
    </div>
    <div class="grid grid-cols-3 gap-3">
      <div class="metric-card"><p class="text-sm">팔로우</p><p class="viz-stat-value">42</p></div>
      <div class="metric-card"><p class="text-sm">플레이리스트</p><p class="viz-stat-value">8</p></div>
      <div class="metric-card"><p class="text-sm">좋아요</p><p class="viz-stat-value">126</p></div>
    </div>
    <div class="grid md:grid-cols-2 gap-4">
      <section class="surface rounded-2xl p-4"><h2 class="font-medium">이번 달 감상 기록</h2><div class="space-y-4 mt-5">${["Electronic:72", "R&B:54", "Indie:38"].map(item => { const [name, value] = item.split(":"); return `<div><div class="flex justify-between text-sm"><span>${name}</span><span>${value}%</span></div><div class="progress h-2 rounded-full mt-2"><span style="width:${value}%"></span></div></div>`; }).join("")}</div></section>
      <section class="surface rounded-2xl p-4"><h2 class="font-medium">가장 많이 들은 아티스트</h2><div class="space-y-3 mt-4">${artists.slice(0, 3).map(artist => `<div class="flex items-center gap-3">${assetBox(artist, "w-11 h-11 rounded-full", artist.initial)}<div><p>${artist.name}</p><p class="text-sm" style="color:var(--muted)">${artist.plays}</p></div></div>`).join("")}</div></section>
    </div>
  `;
}

function renderSettings() {
  return `
    <div><p class="text-sm" style="color:var(--muted)">ACCOUNT</p><h1 class="text-2xl font-medium mt-1">설정</h1></div>
    <div class="grid md:grid-cols-2 gap-4">
      <section class="surface rounded-2xl p-4 space-y-4">
        <h2 class="font-medium">재생 설정</h2>
        <label class="flex items-center justify-between gap-4"><span>자동 재생</span><input type="checkbox" checked class="accent-violet-500"></label>
        <label class="flex items-center justify-between gap-4"><span>고음질 스트리밍</span><input type="checkbox" class="accent-violet-500"></label>
      </section>
      <section class="surface rounded-2xl p-4 space-y-4">
        <h2 class="font-medium">알림</h2>
        <label class="flex items-center justify-between gap-4"><span>신규 앨범 알림</span><input type="checkbox" checked class="accent-violet-500"></label>
        <label class="flex items-center justify-between gap-4"><span>플레이리스트 추천</span><input type="checkbox" checked class="accent-violet-500"></label>
      </section>
    </div>
  `;
}

window.trackitPages = {
  home: renderHome,
  browse: renderBrowse,
  album: renderAlbum,
  artists: renderArtists,
  artistDetail: renderArtistDetail,
  podcasts: renderPodcasts,
  playlist: renderPlaylist,
  search: renderSearch,
  mypage: renderMypage,
  settings: renderSettings
};
