(() => {
  const LIBRARY_KEY = "studio-midnight-mypage-library";
  const allTracks = window.trackitData.tracks || [];
  const clean = value => String(value ?? "").replace(/[&<>'"]/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;"
  })[char]);

  function currentUser() {
    try { return JSON.parse(localStorage.getItem("studio-midnight-user")); } catch { return null; }
  }

  function readLibraries() {
    try { return JSON.parse(localStorage.getItem(LIBRARY_KEY)) || {}; } catch { return {}; }
  }

  function defaultPlaylists() {
    return [
      { id: "night-drive", title: "한밤의 드라이브", description: "도시의 밤과 어울리는 곡", icon: "MoonStar", tracks: allTracks.slice(0, 4), count: 4 },
      { id: "deep-focus", title: "집중이 필요한 오후", description: "차분하게 몰입하는 시간", icon: "Headphones", tracks: allTracks.slice(2, 6), count: 4 },
      { id: "purple-wave", title: "나만의 Purple Wave", description: "자주 듣는 MidnightChord 음악", icon: "Waves", tracks: allTracks.slice(1, 5), count: 4 }
    ];
  }

  function userLibrary(user) {
    const libraries = readLibraries();
    const key = user.email.toLowerCase();
    if (!libraries[key]) libraries[key] = { follows: [], playlists: defaultPlaylists(), likes: [] };
    if (!Array.isArray(libraries[key].playlists)) libraries[key].playlists = defaultPlaylists();
    try {
      const accounts = JSON.parse(localStorage.getItem("studio-midnight-accounts")) || {};
      if (Array.isArray(accounts[key]?.likes)) libraries[key].likes = accounts[key].likes;
    } catch {
      // 손상된 계정 데이터가 있어도 저장된 플레이리스트는 계속 사용할 수 있습니다.
    }
    if (!Array.isArray(libraries[key].likes)) libraries[key].likes = [];
    libraries[key].playlists = libraries[key].playlists.map((playlist, index) => ({
      ...playlist,
      id: playlist.id || `playlist-${index}`,
      tracks: Array.isArray(playlist.tracks) ? playlist.tracks : allTracks.slice(index, index + 4),
      count: Array.isArray(playlist.tracks) ? playlist.tracks.length : Math.min(4, allTracks.length)
    }));
    localStorage.setItem(LIBRARY_KEY, JSON.stringify(libraries));
    return libraries[key];
  }

  function saveLibrary(user, library) {
    const libraries = readLibraries();
    libraries[user.email.toLowerCase()] = library;
    localStorage.setItem(LIBRARY_KEY, JSON.stringify(libraries));
  }

  function recommendationsEnabled(user) {
    try {
      const settings = JSON.parse(localStorage.getItem("studio-midnight-settings")) || {};
      return settings[user.email.toLowerCase()]?.playlistRecommendations !== false;
    } catch {
      return true;
    }
  }

  function followedArtists(user) {
    try {
      const following = JSON.parse(localStorage.getItem("studio-midnight-following")) || {};
      return Array.isArray(following[user.email.toLowerCase()]) ? following[user.email.toLowerCase()] : [];
    } catch {
      return [];
    }
  }

  function trackKey(track) {
    return `${track?.title || ""}::${track?.artist || ""}`;
  }

  function recommendedMix(user, library) {
    const likedArtists = new Set((library.likes || []).map(track => track.artist));
    const followingNames = followedArtists(user).map(artist => artist.name.toLowerCase());
    const playlistTracks = new Set((library.playlists || []).flatMap(playlist => playlist.tracks || []).map(trackKey));
    const likedTracks = new Set((library.likes || []).map(trackKey));
    const scored = allTracks
      .filter(track => !likedTracks.has(trackKey(track)))
      .map(track => {
        let score = 1;
        if (likedArtists.has(track.artist)) score += 4;
        if (followingNames.some(name => name.includes(track.artist.toLowerCase()) || track.artist.toLowerCase().includes(name))) score += 3;
        if (!playlistTracks.has(trackKey(track))) score += 2;
        return { track, score };
      })
      .sort((a, b) => b.score - a.score);
    const tracks = (scored.length ? scored : allTracks.map(track => ({ track, score: 0 }))).slice(0, 6).map(item => item.track);
    const favoriteArtist = [...likedArtists][0] || followedArtists(user)[0]?.name || "";
    return {
      title: favoriteArtist ? `${favoriteArtist} Midnight Mix` : "Midnight Discovery",
      description: favoriteArtist ? `${favoriteArtist}의 음악 취향을 바탕으로 만든 추천` : "새로운 음악을 발견하기 위한 추천 플레이리스트",
      tracks
    };
  }

  function recommendationSection(user, library) {
    if (!recommendationsEnabled(user)) return "";
    const mix = recommendedMix(user, library);
    if (!mix.tracks.length) return "";
    return `<section class="playlist-recommendation surface">
      <div class="playlist-recommendation-copy"><p>FOR YOU</p><h2>${clean(mix.title)}</h2><span>${clean(mix.description)}</span><div class="playlist-recommendation-reasons"><em><i data-lucide="Heart"></i> 좋아요 반영</em><em><i data-lucide="UserRoundPlus"></i> 팔로우 반영</em></div></div>
      <div class="playlist-recommendation-tracks">${mix.tracks.slice(0, 4).map((track, index) => `<div><b>${String(index + 1).padStart(2, "0")}</b><span><strong>${clean(track.title)}</strong><small>${clean(track.artist)}</small></span></div>`).join("")}</div>
      <button type="button" class="purple-btn" data-save-recommendation><i data-lucide="Plus"></i> 내 플레이리스트에 저장</button>
    </section>`;
  }

  function trackRows(tracks) {
    if (!tracks.length) return '<p class="playlist-empty">아직 담긴 곡이 없습니다.</p>';
    return tracks.slice(0, 4).map(track => `<div class="playlist-mini-track"><i data-lucide="Music2"></i><span><strong>${clean(track.title)}</strong><small>${clean(track.artist)}</small></span><time>${clean(track.time || "--:--")}</time></div>`).join("");
  }

  function createDialog(library) {
    const likedTracks = Array.isArray(library.likes) ? library.likes : [];
    return `<dialog class="playlist-create-dialog" data-create-dialog>
      <form data-create-playlist-form>
        <div class="playlist-dialog-head"><div><p>NEW PLAYLIST</p><h2>새 플레이리스트</h2></div><button type="button" data-close-create aria-label="닫기"><i data-lucide="X"></i></button></div>
        <label>플레이리스트 이름<input required minlength="2" maxlength="40" name="title" placeholder="플레이리스트 이름"></label>
        <label>설명<input maxlength="80" name="description" placeholder="어떤 음악을 담을까요?"></label>
        <fieldset class="playlist-track-fieldset">
          <div class="playlist-picker-title"><legend>좋아요한 곡에서 선택</legend><strong data-selected-track-count>${Math.min(3, likedTracks.length)}곡 선택</strong></div>
          <div class="playlist-picker-tools">
            <label class="playlist-track-search"><i data-lucide="Search"></i><input type="search" data-track-filter placeholder="곡 또는 아티스트 검색"></label>
            <div><button type="button" data-select-all-tracks>전체 선택</button><button type="button" data-clear-all-tracks>선택 해제</button></div>
          </div>
          <div class="playlist-track-picker">${likedTracks.map((track, index) => `<label data-track-option data-search-text="${clean(`${track.title} ${track.artist}`.toLowerCase())}"><input type="checkbox" name="tracks" value="${index}" ${index < 3 ? "checked" : ""}><span><strong>${clean(track.title)}</strong><small>${clean(track.artist)}</small></span><time>${clean(track.time)}</time></label>`).join("")}</div>
          ${likedTracks.length ? "" : '<div class="playlist-liked-empty"><i data-lucide="Heart"></i><p>좋아요한 곡이 아직 없습니다.</p><span>좋아하는 곡에 좋아요를 누른 뒤 다시 확인해주세요.</span></div>'}
          <p class="playlist-no-results hidden" data-no-track-results>검색 결과가 없습니다.</p>
        </fieldset>
        <p class="playlist-form-message" data-playlist-message aria-live="polite"></p>
        <button type="submit" class="purple-btn playlist-create-submit">플레이리스트 만들기</button>
      </form>
    </dialog>`;
  }

  function renderPlaylistPage() {
    const user = currentUser();
    if (!user?.email) return `<section class="surface playlist-login-required"><i data-lucide="LockKeyhole"></i><h1>로그인이 필요해요</h1><p>로그인하면 나만의 플레이리스트를 만들고 마이페이지에서 확인할 수 있습니다.</p><button type="button" class="purple-btn" data-page-link="mypage">로그인하러 가기</button></section>`;
    const library = userLibrary(user);
    return `<div class="playlist-page-head"><div><p>MY LIBRARY</p><h1>${clean(user.name)}님의 플레이리스트</h1><span>마이페이지와 자동으로 동기화됩니다.</span></div><button type="button" class="purple-btn" data-open-create><i data-lucide="Plus"></i> 새 플레이리스트</button></div>
      ${recommendationSection(user, library)}
      <div class="user-playlist-grid">${library.playlists.length ? library.playlists.map((playlist, index) => `<article class="user-playlist-card">
        <div class="user-playlist-cover"><i data-lucide="${clean(playlist.icon || "ListMusic")}"></i><span>${playlist.tracks.length}곡</span></div>
        <div class="user-playlist-info"><h2>${clean(playlist.title)}</h2><p>${clean(playlist.description || "설명 없는 플레이리스트")}</p></div>
        <div class="playlist-mini-list">${trackRows(playlist.tracks)}</div>
        <div class="user-playlist-actions"><button type="button" class="purple-btn" data-play-user-playlist="${index}"><i data-lucide="Play"></i> 전체 재생</button><button type="button" class="playlist-delete" data-delete-user-playlist="${index}" aria-label="${clean(playlist.title)} 삭제"><i data-lucide="Trash2"></i></button></div>
      </article>`).join("") : '<div class="surface playlist-empty-library"><i data-lucide="ListPlus"></i><p>첫 플레이리스트를 만들어보세요.</p></div>'}</div>${createDialog(library)}`;
  }

  function rerender() {
    const root = document.querySelector("[data-page-root]");
    if (root) root.innerHTML = renderPlaylistPage();
    window.lucide?.createIcons();
  }

  function updateSelectedTrackCount(form) {
    const count = form.querySelectorAll('input[name="tracks"]:checked').length;
    const output = form.querySelector("[data-selected-track-count]");
    if (output) output.textContent = `${count}곡 선택`;
  }

  function visibleTrackOptions(form) {
    return [...form.querySelectorAll("[data-track-option]")].filter(option => !option.classList.contains("hidden"));
  }

  window.trackitPages.playlist = renderPlaylistPage;

  document.addEventListener("click", event => {
    if (event.target.closest("[data-open-create]")) return document.querySelector("[data-create-dialog]")?.showModal();
    if (event.target.closest("[data-close-create]")) return event.target.closest("dialog")?.close();
    if (event.target.matches("[data-create-dialog]")) return event.target.close();
    if (event.target.closest("[data-save-recommendation]")) {
      const user = currentUser();
      const library = userLibrary(user);
      const mix = recommendedMix(user, library);
      if (!mix.tracks.length) return;
      const existingTitles = new Set(library.playlists.map(playlist => playlist.title));
      let title = mix.title;
      let suffix = 2;
      while (existingTitles.has(title)) title = `${mix.title} ${suffix++}`;
      library.playlists.unshift({ id: crypto.randomUUID?.() || `recommendation-${Date.now()}`, title, description: mix.description, icon: "Sparkles", tracks: mix.tracks, count: mix.tracks.length });
      saveLibrary(user, library);
      rerender();
      return;
    }
    const selectAll = event.target.closest("[data-select-all-tracks]");
    if (selectAll) {
      const form = selectAll.closest("form");
      visibleTrackOptions(form).forEach(option => { option.querySelector('input[name="tracks"]').checked = true; });
      updateSelectedTrackCount(form);
      return;
    }
    const clearAll = event.target.closest("[data-clear-all-tracks]");
    if (clearAll) {
      const form = clearAll.closest("form");
      form.querySelectorAll('input[name="tracks"]').forEach(input => { input.checked = false; });
      updateSelectedTrackCount(form);
      return;
    }
    const deleteButton = event.target.closest("[data-delete-user-playlist]");
    if (deleteButton) {
      const user = currentUser();
      const library = userLibrary(user);
      const playlist = library.playlists[Number(deleteButton.dataset.deleteUserPlaylist)];
      if (!playlist || !confirm(`“${playlist.title}” 플레이리스트를 삭제할까요?`)) return;
      library.playlists.splice(Number(deleteButton.dataset.deleteUserPlaylist), 1);
      saveLibrary(user, library);
      rerender();
      return;
    }
    const playButton = event.target.closest("[data-play-user-playlist]");
    if (playButton) {
      event.stopImmediatePropagation();
      const playlist = userLibrary(currentUser()).playlists[Number(playButton.dataset.playUserPlaylist)];
      if (!playlist?.tracks.length) return;
      window.trackitData.tracks.splice(0, window.trackitData.tracks.length, ...playlist.tracks);
      playTrackByIndex(0);
    }
  });

  document.addEventListener("input", event => {
    if (!event.target.matches("[data-track-filter]")) return;
    const form = event.target.closest("form");
    const query = event.target.value.trim().toLowerCase();
    let visibleCount = 0;
    form.querySelectorAll("[data-track-option]").forEach(option => {
      const visible = !query || option.dataset.searchText.includes(query);
      option.classList.toggle("hidden", !visible);
      if (visible) visibleCount += 1;
    });
    const totalCount = form.querySelectorAll("[data-track-option]").length;
    form.querySelector("[data-no-track-results]")?.classList.toggle("hidden", visibleCount > 0 || totalCount === 0);
  });

  document.addEventListener("change", event => {
    if (event.target.matches('input[name="tracks"]')) updateSelectedTrackCount(event.target.closest("form"));
  });

  document.addEventListener("submit", event => {
    if (!event.target.matches("[data-create-playlist-form]")) return;
    event.preventDefault();
    const form = event.target;
    const data = new FormData(form);
    const title = String(data.get("title") || "").trim();
    const message = form.querySelector("[data-playlist-message]");
    if (title.length < 2) { message.textContent = "이름을 2자 이상 입력해주세요."; return; }
    const user = currentUser();
    const library = userLibrary(user);
    const likedTracks = Array.isArray(library.likes) ? library.likes : [];
    const selectedTracks = data.getAll("tracks").map(Number).map(index => likedTracks[index]).filter(Boolean);
    if (!selectedTracks.length) { message.textContent = "좋아요한 곡을 한 개 이상 선택해주세요."; return; }
    library.playlists.unshift({ id: crypto.randomUUID?.() || `playlist-${Date.now()}`, title, description: String(data.get("description") || "").trim(), icon: "ListMusic", tracks: selectedTracks, count: selectedTracks.length });
    saveLibrary(user, library);
    form.closest("dialog").close();
    rerender();
  });
})();
