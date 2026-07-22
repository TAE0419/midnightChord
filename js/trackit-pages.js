const { albums, tracks, artists, playlists } = window.trackitData;

function icon(name, className = "w-4 h-4") {
  return `<i data-lucide="${name}" class="${className}"></i>`;
}

function albumTile(album, framed = false) {
  const body = `
    <div class="${album.art} rounded-2xl aspect-square flex items-center justify-center text-4xl">${album.icon || ""}</div>
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

function renderAlbum() {
  return `
    <div class="grid md:grid-cols-[250px_1fr] gap-6 items-end">
      <div class="album-art rounded-3xl aspect-square"></div>
      <div>
        <p class="text-sm" style="color:var(--muted)">ALBUM</p>
        <h1 class="text-3xl md:text-5xl font-medium mt-2">Violet Night</h1>
        <p class="mt-3">LUNA · 2026 · 10곡</p>
        <div class="flex gap-2 mt-5">
          <button type="button" class="purple-btn rounded-xl px-5 py-2" data-play-track="0">전체 재생</button>
          <button type="button" class="surface rounded-xl px-4 py-2">${icon("Heart")} 저장</button>
        </div>
      </div>
    </div>
    <div class="surface rounded-2xl overflow-hidden">${tracks.slice(0, 4).map((track, index) => trackRow(track, index, { active: index === 1 })).join("")}</div>
  `;
}

function renderArtists() {
  return `
    <div><p class="text-sm" style="color:var(--muted)">ARTISTS</p><h1 class="text-2xl font-medium mt-1">아티스트</h1></div>
    <div class="grid md:grid-cols-2 gap-4">
      ${artists.map(artist => `
        <article class="surface rounded-2xl p-4 flex items-center gap-4">
          <div class="w-14 h-14 rounded-full purple-soft flex items-center justify-center text-xl">${artist.initial}</div>
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
      <div class="album-art rounded-full aspect-square max-w-[150px] w-full mx-auto flex items-center justify-center text-4xl">${artist.initial}</div>
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
  return `
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div><p class="text-sm" style="color:var(--muted)">MY LIBRARY</p><h1 class="text-2xl font-medium mt-1">플레이리스트</h1></div>
      <button type="button" class="purple-btn rounded-xl px-4 py-2">+ 새 플레이리스트</button>
    </div>
    <div class="grid md:grid-cols-3 gap-4">
      ${playlists.map(item => `
        <article class="surface rounded-2xl p-4">
          <div class="${item.art} rounded-xl aspect-square flex items-center justify-center text-4xl">${item.icon ? icon(item.icon, "w-10 h-10") : ""}</div>
          <p class="font-medium mt-3">${item.title}</p>
          <p class="text-sm" style="color:var(--muted)">${item.meta}</p>
        </article>
      `).join("")}
    </div>
    <div class="surface rounded-2xl p-4">
      <h2 class="font-medium mb-3">최근 들은 곡</h2>
      ${tracks.slice(0, 2).map((track, index) => trackRow(track, index, { art: albums[index].art, trailing: index === 0 ? "2분 전" : "18분 전" })).join("")}
    </div>
  `;
}

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
      <section class="surface rounded-2xl p-4"><h2 class="font-medium">가장 많이 들은 아티스트</h2><div class="space-y-3 mt-4">${artists.slice(0, 3).map(artist => `<div class="flex items-center gap-3"><div class="w-11 h-11 rounded-full surface-soft flex items-center justify-center">${artist.initial}</div><div><p>${artist.name}</p><p class="text-sm" style="color:var(--muted)">${artist.plays}</p></div></div>`).join("")}</div></section>
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
