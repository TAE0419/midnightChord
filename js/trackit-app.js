const appState = {
  playing: false,
  currentTrackIndex: 0,
  user: null,
  signupError: "",
  searchQuery: ""
};

let artistWaveAnimationFrame = null;

function setArtistWave(button, active) {
  document.querySelectorAll("[data-personal-artist-audio]").forEach(item => {
    item.classList.remove("is-wave-active");
    item.setAttribute("aria-label", "아티스트 음악 재생");
  });

  if (artistWaveAnimationFrame) cancelAnimationFrame(artistWaveAnimationFrame);
  artistWaveAnimationFrame = null;
  if (!active || !button) return;

  button.classList.add("is-wave-active");
  button.setAttribute("aria-label", "아티스트 음악 일시정지");
  const path = button.querySelector(".artist-wave path");
  if (!path) return;

  const drawWave = time => {
    if (!button.classList.contains("is-wave-active")) return;
    const points = [];
    for (let x = 0; x <= 180; x += 2) {
      const envelope = Math.sin((Math.PI * x) / 180);
      const wave =
        Math.sin(x * .68 + time * .018) * 4.5 +
        Math.sin(x * .37 - time * .011) * 2.3 +
        Math.sin(x * 1.08 + time * .024) * 1.2;
      points.push(`${x === 0 ? "M" : "L"}${x} ${(15 + wave * envelope).toFixed(2)}`);
    }
    path.setAttribute("d", points.join(" "));
    artistWaveAnimationFrame = requestAnimationFrame(drawWave);
  };

  artistWaveAnimationFrame = requestAnimationFrame(drawWave);
}

function currentPageId() {
  return document.body.dataset.currentPage || "home";
}

function pageUrl(pageId) {
  if (pageId === "search") {
    return "pages/search/";
  }
  if (pageId === "artist-detail") {
    return "pages/artist-detail/";
  }
  const page = window.trackitData.pages.find(item => item.id === pageId);
  return page ? page.href : "pages/home/";
}

function renderNavigation() {
  const nav = document.querySelector("[data-nav]");
  const activePage = currentPageId();
  nav.innerHTML = window.trackitData.pages.map(page => `
    <a class="nav-link ${page.id === activePage ? "active" : ""} w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-left" href="${page.href}" data-page="${page.id}">
      <i data-lucide="${page.icon}" class="w-5 h-5 shrink-0"></i>
      <span class="hidden md:inline">${page.label}</span>
    </a>
  `).join("");
}

function renderCurrentPage() {
  const pageRoot = document.querySelector("[data-page-root]");
  const pageId = currentPageId();
  const params = new URLSearchParams(window.location.search);

  if (pageId === "mypage") {
    pageRoot.innerHTML = window.trackitPages.mypage(appState.user, appState.signupError);
    return;
  }
  if (pageId === "search") {
    appState.searchQuery = params.get("q") || "";
    pageRoot.innerHTML = window.trackitPages.search(appState.searchQuery);
    return;
  }
  if (pageId === "artist-detail") {
    pageRoot.innerHTML = window.trackitPages.artistDetail(params.get("name") || "LUNA");
    return;
  }

  pageRoot.innerHTML = window.trackitPages[pageId] ? window.trackitPages[pageId]() : window.trackitPages.home();
}

function navigateToPage(pageId) {
  window.location.href = new URL(pageUrl(pageId), document.baseURI).href;
}

function bindNavigation() {
  document.addEventListener("click", event => {
    const pageLink = event.target.closest("[data-page-link]");
    const artistLink = event.target.closest("[data-artist-name]");
    const playTrack = event.target.closest("[data-play-track]");
    const trackRow = event.target.closest("[data-track-index]");

    if (artistLink) {
      window.location.href = new URL(`${pageUrl("artist-detail")}?name=${encodeURIComponent(artistLink.dataset.artistName)}`, document.baseURI).href;
      return;
    }
    if (playTrack) {
      playTrackByIndex(Number(playTrack.dataset.playTrack));
      return;
    }
    if (trackRow) {
      playTrackByIndex(Number(trackRow.dataset.trackIndex));
      return;
    }
    if (pageLink) {
      navigateToPage(pageLink.dataset.pageLink);
    }
  });
}

function bindSearch() {
  const searchInput = document.querySelector("[data-search-input]");
  if (!searchInput) {
    return;
  }

  if (currentPageId() === "search") {
    searchInput.value = appState.searchQuery;
    searchInput.addEventListener("input", () => {
      appState.searchQuery = searchInput.value.trim();
      document.querySelector("[data-page-root]").innerHTML = window.trackitPages.search(appState.searchQuery);
      createLucideIcons();
    });
    return;
  }

  searchInput.addEventListener("focus", () => {
    window.location.href = new URL(pageUrl("search"), document.baseURI).href;
  });
}

function renderMypage() {
  if (currentPageId() !== "mypage") {
    return;
  }
  document.querySelector("[data-page-root]").innerHTML = window.trackitPages.mypage(appState.user, appState.signupError);
}

function validateSignup(form) {
  const formData = new FormData(form);
  const name = formData.get("name").trim();
  const email = formData.get("email").trim();
  const password = formData.get("password");
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (name.length < 2) {
    return { valid: false, message: "이름은 2자 이상 입력해주세요." };
  }
  if (!emailPattern.test(email)) {
    return { valid: false, message: "이메일 형식을 확인해주세요." };
  }
  if (password.length < 6) {
    return { valid: false, message: "비밀번호는 6자 이상 입력해주세요." };
  }

  return {
    valid: true,
    user: { name, email }
  };
}

function bindMembership() {
  document.addEventListener("submit", event => {
    if (!event.target.matches("[data-signup-form]")) {
      return;
    }

    event.preventDefault();
    const result = validateSignup(event.target);
    if (!result.valid) {
      appState.signupError = result.message;
      renderMypage();
      return;
    }

    appState.signupError = "";
    appState.user = result.user;
    localStorage.setItem("studio-midnight-user", JSON.stringify(appState.user));
    renderMypage();
  });

  document.addEventListener("click", event => {
    if (!event.target.closest("[data-logout]")) {
      return;
    }

    localStorage.removeItem("studio-midnight-user");
    appState.user = null;
    appState.signupError = "";
    renderMypage();
  });
}

function getPlayerElements() {
  return {
    audio: document.getElementById("studioAudio"),
    title: document.getElementById("playerTitle"),
    artist: document.getElementById("playerArtist"),
    status: document.getElementById("playerStatus"),
    progress: document.getElementById("playerProgress"),
    sidebarTitle: document.querySelector("[data-sidebar-player-title]"),
    sidebarProgress: document.querySelector("[data-sidebar-player-progress]"),
    buttons: [
      document.getElementById("playerToggle"),
      document.getElementById("mobilePlay")
    ]
  };
}

function getCurrentTrack() {
  return window.trackitData.tracks[appState.currentTrackIndex] || window.trackitData.tracks[0];
}

function updatePlayerMeta(status = "") {
  const track = getCurrentTrack();
  const player = getPlayerElements();

  player.title.textContent = track.title;
  player.artist.textContent = track.artist;
  player.status.textContent = status || track.audioSrc;
  player.sidebarTitle.textContent = track.title;

  document.querySelectorAll("[data-track-index]").forEach(item => {
    item.classList.toggle("purple-soft", Number(item.dataset.trackIndex) === appState.currentTrackIndex);
  });
}

function updatePlayButtons() {
  const player = getPlayerElements();
  player.buttons.forEach(button => {
    button.innerHTML = `<i data-lucide="${appState.playing ? "Pause" : "Play"}" class="w-4 h-4"></i>`;
  });
  createLucideIcons();
}

function loadTrack(index) {
  const tracks = window.trackitData.tracks;
  appState.currentTrackIndex = (index + tracks.length) % tracks.length;
  const track = getCurrentTrack();
  const player = getPlayerElements();

  if (player.audio.getAttribute("src") !== track.audioSrc) {
    player.audio.src = track.audioSrc;
    player.audio.load();
  }

  updatePlayerMeta();
  updateProgress(0);
}

function playTrackByIndex(index) {
  const player = getPlayerElements();
  loadTrack(Number.isFinite(index) ? index : 0);
  player.audio.play()
    .then(() => {
      appState.playing = true;
      updatePlayerMeta("재생 중");
      updatePlayButtons();
    })
    .catch(() => {
      appState.playing = false;
      updatePlayerMeta("음원 파일을 assets/audio 폴더에 넣어주세요.");
      updatePlayButtons();
    });
}

function togglePlayback() {
  const player = getPlayerElements();
  if (!player.audio.getAttribute("src")) {
    loadTrack(appState.currentTrackIndex);
  }

  if (player.audio.paused) {
    player.audio.play()
      .then(() => {
        appState.playing = true;
        updatePlayerMeta("재생 중");
        updatePlayButtons();
      })
      .catch(() => {
        appState.playing = false;
        updatePlayerMeta("음원 파일을 assets/audio 폴더에 넣어주세요.");
        updatePlayButtons();
      });
    return;
  }

  player.audio.pause();
  appState.playing = false;
  updatePlayerMeta("일시정지");
  updatePlayButtons();
}

function updateProgress(percent) {
  const player = getPlayerElements();
  const safePercent = Number.isFinite(percent) ? Math.max(0, Math.min(100, percent)) : 0;
  player.progress.style.width = `${safePercent}%`;
  player.sidebarProgress.style.width = `${safePercent}%`;
}

function bindPlayer() {
  const player = getPlayerElements();

  player.buttons.forEach(button => {
    button.addEventListener("click", togglePlayback);
  });

  document.getElementById("playerPrev").addEventListener("click", () => {
    playTrackByIndex(appState.currentTrackIndex - 1);
  });

  document.getElementById("playerNext").addEventListener("click", () => {
    playTrackByIndex(appState.currentTrackIndex + 1);
  });

  player.audio.addEventListener("timeupdate", () => {
    updateProgress((player.audio.currentTime / player.audio.duration) * 100);
  });

  player.audio.addEventListener("ended", () => {
    if (player.audio.dataset.playlistArtistIndex !== undefined && typeof window.trackitPlaylistPlayArtist === "function") {
      const currentArtistIndex = Number(player.audio.dataset.playlistArtistIndex);
      window.trackitPlaylistPlayArtist((currentArtistIndex + 1) % window.trackitData.artists.length, true);
      return;
    }
    playTrackByIndex(appState.currentTrackIndex + 1);
  });

  player.audio.addEventListener("error", () => {
    appState.playing = false;
    updatePlayerMeta("음원 파일을 assets/audio 폴더에 넣어주세요.");
    updatePlayButtons();
    updateProgress(0);
  });

  loadTrack(appState.currentTrackIndex);
  updatePlayButtons();
}

function loadLocalUser() {
  try {
    const storedUser = JSON.parse(localStorage.getItem("studio-midnight-user"));
    if (storedUser && typeof storedUser.name === "string" && typeof storedUser.email === "string") {
      appState.user = storedUser;
      return;
    }
  } catch {
    localStorage.removeItem("studio-midnight-user");
  }
  appState.user = null;
}

function createLucideIcons() {
  if (window.lucide) {
    lucide.createIcons();
  }
}

function bootTrackit() {
  loadLocalUser();
  renderNavigation();
  renderCurrentPage();
  bindNavigation();
  bindSearch();
  bindMembership();
  bindPlayer();
  createLucideIcons();
}

document.addEventListener("DOMContentLoaded", bootTrackit);
