const appState = {
  playing: false,
  currentTrackIndex: 0,
  user: null,
  signupError: "",
  searchQuery: ""
};
const APP_SETTINGS_KEY = "studio-midnight-settings";

let artistWaveAnimationFrame = null;

function currentSettingsUserKey() {
  return appState.user?.email?.toLowerCase() || "guest";
}

function getPlaybackSettings() {
  try {
    const allSettings = JSON.parse(localStorage.getItem(APP_SETTINGS_KEY)) || {};
    return {
      autoplay: allSettings[currentSettingsUserKey()]?.autoplay !== false,
      highQuality: allSettings[currentSettingsUserKey()]?.highQuality === true,
      albumNotifications: allSettings[currentSettingsUserKey()]?.albumNotifications !== false,
      playlistRecommendations: allSettings[currentSettingsUserKey()]?.playlistRecommendations !== false
    };
  } catch {
    return { autoplay: true, highQuality: false, albumNotifications: true, playlistRecommendations: true };
  }
}

function highQualitySource(track) {
  if (track?.highQualityAudioSrc) return track.highQualityAudioSrc;
  if (!track?.audioSrc?.startsWith("assets/audio/") || track.audioSrc.includes("/podcasts/")) return "";
  return track.audioSrc.replace("assets/audio/", "assets/audio/high/").replace(/\.mp3$/i, ".wav");
}

function preferredAudioSource(track) {
  const highQuality = getPlaybackSettings().highQuality;
  return highQuality ? (highQualitySource(track) || track.audioSrc) : track.audioSrc;
}

function preferredStudioAudioSource(source) {
  if (!getPlaybackSettings().highQuality || !source || source.includes("/podcasts/")) return source;
  return source.replace("assets/audio/", "assets/audio/high/").replace(/\.mp3$/i, ".wav");
}
window.preferredStudioAudioSource = preferredStudioAudioSource;

function applyAudioQualitySetting() {
  const player = getPlayerElements();
  const track = getCurrentTrack();
  if (!player.audio || !track) return;
  const nextSource = preferredAudioSource(track);
  const currentSource = player.audio.getAttribute("src") || "";
  if (!nextSource || currentSource === nextSource) return;
  const currentTime = player.audio.currentTime || 0;
  const shouldResume = !player.audio.paused;
  player.audio.src = nextSource;
  player.audio.load();
  player.audio.addEventListener("loadedmetadata", () => {
    if (Number.isFinite(currentTime)) player.audio.currentTime = Math.min(currentTime, player.audio.duration || currentTime);
    if (shouldResume) player.audio.play().catch(() => {});
  }, { once: true });
  updatePlayerMeta(getPlaybackSettings().highQuality ? "고음질 스트리밍" : "일반 음질 스트리밍");
}
window.applyAudioQualitySetting = applyAudioQualitySetting;

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
    const likeButton = event.target.closest("[data-like-track]");

    if (likeButton) {
      event.stopPropagation();
      toggleTrackLike(Number(likeButton.dataset.likeTrack));
      return;
    }
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

function readUserAccounts() {
  try {
    const accounts = JSON.parse(localStorage.getItem("studio-midnight-accounts"));
    return accounts && typeof accounts === "object" ? accounts : {};
  } catch {
    return {};
  }
}

function trackIdentity(track) {
  return `${track?.title || ""}::${track?.artist || ""}`;
}

function currentUserLikes() {
  if (!appState.user?.email) return [];
  const account = readUserAccounts()[appState.user.email.toLowerCase()];
  return Array.isArray(account?.likes) ? account.likes : [];
}

function syncLikeButtons() {
  const likedTracks = new Set(currentUserLikes().map(trackIdentity));
  document.querySelectorAll("[data-like-track]").forEach(button => {
    const track = window.trackitData.tracks[Number(button.dataset.likeTrack)];
    const liked = likedTracks.has(trackIdentity(track));
    button.classList.toggle("is-liked", liked);
    button.setAttribute("aria-pressed", String(liked));
    button.setAttribute("aria-label", liked ? `${track?.title || "곡"} 좋아요 취소` : `${track?.title || "곡"} 좋아요`);
    button.innerHTML = `<i data-lucide="Heart" class="w-4 h-4${liked ? " fill-current" : ""}"></i>`;
  });
}

function toggleTrackLike(trackIndex) {
  const track = window.trackitData.tracks[trackIndex];
  if (!track) return;
  if (!appState.user?.email) {
    alert("좋아요를 저장하려면 먼저 로그인해주세요.");
    navigateToPage("mypage");
    return;
  }

  const accounts = readUserAccounts();
  const userKey = appState.user.email.toLowerCase();
  const account = accounts[userKey] || {
    name: appState.user.name,
    email: appState.user.email,
    likes: []
  };
  const likes = Array.isArray(account.likes) ? account.likes : [];
  const key = trackIdentity(track);
  account.likes = likes.some(item => trackIdentity(item) === key)
    ? likes.filter(item => trackIdentity(item) !== key)
    : [...likes, {
        title: track.title,
        artist: track.artist,
        time: track.time || "--:--",
        audioSrc: track.audioSrc || "",
        highQualityAudioSrc: track.highQualityAudioSrc || ""
      }];
  accounts[userKey] = account;
  localStorage.setItem("studio-midnight-accounts", JSON.stringify(accounts));

  appState.user = { ...appState.user, likes: account.likes };
  localStorage.setItem("studio-midnight-user", JSON.stringify(appState.user));
  let libraries = {};
  try { libraries = JSON.parse(localStorage.getItem("studio-midnight-mypage-library")) || {}; } catch { libraries = {}; }
  libraries[userKey] = libraries[userKey] || { follows: [], playlists: [], likes: [] };
  libraries[userKey].likes = account.likes;
  localStorage.setItem("studio-midnight-mypage-library", JSON.stringify(libraries));

  if (currentPageId() === "mypage") renderMypage();
  syncLikeButtons();
  createLucideIcons();
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
    renderHeaderUserProfile();
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

  const audioSource = preferredAudioSource(track);
  if (player.audio.getAttribute("src") !== audioSource) {
    player.audio.src = audioSource;
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
    if (!getPlaybackSettings().autoplay) {
      appState.playing = false;
      updatePlayerMeta("자동 재생이 꺼져 있습니다.");
      updatePlayButtons();
      updateProgress(100);
      return;
    }
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

function notificationAlbums() {
  if (!appState.user?.email || !getPlaybackSettings().albumNotifications) return [];
  let allFollowing = {};
  try { allFollowing = JSON.parse(localStorage.getItem("studio-midnight-following")) || {}; } catch { allFollowing = {}; }
  const follows = allFollowing[appState.user.email.toLowerCase()] || [];
  return (window.trackitData.albums || []).filter(album =>
    follows.some(item => {
      const followedName = String(item.name || "").toLowerCase();
      const albumArtist = String(album.artist || "").toLowerCase();
      return followedName.includes(albumArtist) || albumArtist.includes(followedName);
    })
  );
}

function notificationText(value) {
  return String(value ?? "").replace(/[&<>'"]/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;"
  })[char]);
}

function ensureNotificationDialog() {
  let dialog = document.querySelector("[data-album-notification-dialog]");
  if (dialog) return dialog;
  dialog = document.createElement("dialog");
  dialog.className = "album-notification-dialog";
  dialog.dataset.albumNotificationDialog = "";
  dialog.setAttribute("aria-labelledby", "album-notification-title");
  dialog.addEventListener("click", event => {
    if (event.target === dialog || event.target.closest("[data-close-album-notifications]")) dialog.close();
  });
  document.body.appendChild(dialog);
  return dialog;
}

function renderNotificationDialog() {
  const dialog = ensureNotificationDialog();
  const notices = notificationAlbums();
  const enabled = getPlaybackSettings().albumNotifications;
  let body = "";

  if (!appState.user) {
    body = `<div class="album-notification-empty">
      <i data-lucide="LogIn"></i>
      <strong>로그인이 필요해요</strong>
      <p>로그인하면 팔로우한 아티스트의 신규 앨범을 확인할 수 있습니다.</p>
      <button type="button" class="album-notification-primary" data-page-link="mypage">로그인하기</button>
    </div>`;
  } else if (!enabled) {
    body = `<div class="album-notification-empty">
      <i data-lucide="BellOff"></i>
      <strong>앨범 알림이 꺼져 있어요</strong>
      <p>설정에서 신규 앨범 알림을 켜면 이곳에서 소식을 받을 수 있습니다.</p>
      <button type="button" class="album-notification-primary" data-page-link="settings">설정으로 이동</button>
    </div>`;
  } else if (!notices.length) {
    body = `<div class="album-notification-empty">
      <i data-lucide="BellRing"></i>
      <strong>새로운 알림이 없습니다</strong>
      <p>아티스트를 팔로우하면 신규 앨범 소식이 여기에 표시됩니다.</p>
      <button type="button" class="album-notification-primary" data-page-link="artists">아티스트 둘러보기</button>
    </div>`;
  } else {
    body = `<div class="album-notification-list">${notices.map(album => `
      <button type="button" class="album-notification-item" data-page-link="album">
        <span class="album-notification-cover">
          ${album.imageSrc
            ? `<img src="${notificationText(album.imageSrc)}" alt="${notificationText(album.title)} 앨범 커버">`
            : `<i data-lucide="Disc3"></i>`}
        </span>
        <span class="album-notification-copy">
          <small>NEW ALBUM</small>
          <strong>${notificationText(album.title)}</strong>
          <span>${notificationText(album.artist)} · ${notificationText(album.year || "")}</span>
        </span>
        <i data-lucide="ChevronRight" class="album-notification-arrow"></i>
      </button>`).join("")}</div>`;
  }

  dialog.innerHTML = `
    <div class="album-notification-panel">
      <header class="album-notification-header">
        <div><p>NOTIFICATIONS</p><h2 id="album-notification-title">신규 앨범 알림</h2></div>
        <button type="button" data-close-album-notifications aria-label="알림 창 닫기"><i data-lucide="X"></i></button>
      </header>
      <div class="album-notification-summary">
        <span>${enabled ? "알림 켜짐" : "알림 꺼짐"}</span>
        <strong>${notices.length}개의 새 소식</strong>
      </div>
      ${body}
    </div>`;
  createLucideIcons();
  return dialog;
}

function bindAlbumNotifications() {
  const button = document.querySelector('header button[aria-label="알림"]');
  if (!button || button.dataset.notificationsBound === "true") return;
  button.dataset.notificationsBound = "true";
  button.style.position = "relative";

  const refreshBadge = () => {
    button.querySelector("[data-notification-badge]")?.remove();
    const notices = notificationAlbums();
    if (!notices.length) return;
    const badge = document.createElement("span");
    badge.dataset.notificationBadge = "";
    badge.textContent = notices.length > 9 ? "9+" : String(notices.length);
    badge.style.cssText = "position:absolute;right:-5px;top:-6px;min-width:17px;height:17px;padding:0 4px;border-radius:999px;display:grid;place-items:center;background:#ef4444;color:white;font-size:10px;font-weight:700";
    button.appendChild(badge);
  };

  refreshBadge();
  button.addEventListener("click", () => {
    renderNotificationDialog().showModal();
  });
  window.addEventListener("studio-midnight:settings-changed", refreshBadge);
  window.addEventListener("studio-midnight:following-changed", refreshBadge);
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

function renderHeaderUserProfile() {
  let avatar = document.querySelector("[data-header-user]");
  if (!avatar) {
    avatar = document.querySelector("header .flex.items-center.gap-3 > div:last-child");
    if (avatar) avatar.dataset.headerUser = "";
  }
  if (!avatar) return;

  avatar.classList.add("header-user-avatar");
  avatar.textContent = "";
  avatar.title = appState.user?.name || "로그인하지 않음";
  if (appState.user?.profileImage) {
    const image = document.createElement("img");
    image.src = appState.user.profileImage;
    image.alt = `${appState.user.name || "사용자"} 프로필`;
    image.addEventListener("error", () => {
      avatar.textContent = appState.user?.name?.trim()?.slice(0, 1).toUpperCase() || "MC";
    }, { once: true });
    avatar.appendChild(image);
  } else {
    avatar.textContent = appState.user?.name?.trim()?.slice(0, 1).toUpperCase() || "MC";
  }
}
window.renderHeaderUserProfile = renderHeaderUserProfile;

function createLucideIcons() {
  syncLikeButtons();
  if (window.lucide) {
    lucide.createIcons();
  }
}

function bootTrackit() {
  loadLocalUser();
  renderHeaderUserProfile();
  renderNavigation();
  renderCurrentPage();
  bindNavigation();
  bindSearch();
  bindMembership();
  bindPlayer();
  bindAlbumNotifications();
  window.addEventListener("studio-midnight:settings-changed", event => {
    if (event.detail?.name === "highQuality") applyAudioQualitySetting();
  });
  createLucideIcons();
}

document.addEventListener("DOMContentLoaded", bootTrackit);
