const { artists } = window.trackitData;

function assetBox(item, className, fallback = "") {
  if (item.imageSrc) {
    return `<img src="${item.imageSrc}" alt="${item.title || item.name}" class="${className} object-cover" onerror="this.replaceWith(Object.assign(document.createElement('div'), { className: '${className} ${item.art || 'purple-soft'} flex items-center justify-center text-4xl', textContent: '${fallback}' }))">`;
  }
  return `<div class="${className} ${item.art || 'purple-soft'} flex items-center justify-center text-4xl">${fallback}</div>`;
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
      <div class="metric-card"><p class="text-sm">팔로잉</p><p class="viz-stat-value">42</p></div>
      <div class="metric-card"><p class="text-sm">플레이리스트</p><p class="viz-stat-value">8</p></div>
      <div class="metric-card"><p class="text-sm">좋아요</p><p class="viz-stat-value">126</p></div>
    </div>
    <div class="grid md:grid-cols-2 gap-4">
      <section class="surface rounded-2xl p-4"><h2 class="font-medium">이번 달 감상 기록</h2><div class="space-y-4 mt-5">${["Electronic:72", "R&B:54", "Indie:38"].map(item => { const [name, value] = item.split(":"); return `<div><div class="flex justify-between text-sm"><span>${name}</span><span>${value}%</span></div><div class="progress h-2 rounded-full mt-2"><span style="width:${value}%"></span></div></div>`; }).join("")}</div></section>
      <section class="surface rounded-2xl p-4"><h2 class="font-medium">가장 많이 들은 아티스트</h2><div class="space-y-3 mt-4">${artists.slice(0, 3).map(artist => `<div class="flex items-center gap-3">${assetBox(artist, "w-11 h-11 rounded-full", artist.initial)}<div><p>${artist.name}</p><p class="text-sm" style="color:var(--muted)">${artist.plays}</p></div></div>`).join("")}</div></section>
    </div>
  `;
}

window.trackitPages = window.trackitPages || {};
window.trackitPages.mypage = renderMypage;

// Logged-in library view. Kept self-contained so no shared file needs changes.
(() => {
  const LIBRARY_KEY = "studio-midnight-mypage-library";
  const ACCOUNTS_KEY = "studio-midnight-accounts";
  const FOLLOWING_KEY = "studio-midnight-following";
  let activeLibraryTab = "follows";
  let activeMypageUser = null;
  let pendingProfileImage = null;
  let shouldRemoveProfileImage = false;
  let pendingDeletePlaylistIndex = null;
  const clean = value => String(value ?? "").replace(/[&<>'"]/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;"
  })[char]);

  function defaultLibrary() {
    const follows = artists.filter(item => item?.name).slice(0, 3).map((item, index) => ({
      name: item.name, initial: item.initial || item.name[0], imageSrc: item.imageSrc || "",
      genre: ["Alternative", "R&B", "Lo-fi"][index]
    }));
    return {
      follows,
      playlists: [
        { title: "한밤의 드라이브", description: "도시의 밤과 어울리는 곡", count: 18, icon: "MoonStar" },
        { title: "집중이 필요한 오후", description: "차분하게 몰입하는 시간", count: 12, icon: "Headphones" },
        { title: "나만의 Purple Wave", description: "자주 듣는 MidnightChord 음악", count: 9, icon: "Waves" }
      ],
      likes: []
    };
  }

  function getLibrary(user) {
    const fallback = defaultLibrary();
    try {
      const all = JSON.parse(localStorage.getItem(LIBRARY_KEY)) || {};
      const userKey = user.email.toLowerCase();
      if (!all[userKey] && all[user.email]) all[userKey] = all[user.email];
      if (!all[userKey]) {
        all[userKey] = fallback;
        localStorage.setItem(LIBRARY_KEY, JSON.stringify(all));
      }
      const library = all[userKey];
      let following = {};
      try {
        following = JSON.parse(localStorage.getItem(FOLLOWING_KEY)) || {};
      } catch {
        following = {};
      }
      library.follows = Array.isArray(following[userKey])
        ? following[userKey]
        : [];
      const accounts = readAccounts();
      const account = accounts[userKey];
      if (account) {
        if (!Array.isArray(account.likes)) {
          account.likes = [];
          localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
        }
        library.likes = account.likes;
      } else {
        library.likes = Array.isArray(user.likes) ? user.likes : [];
      }
      localStorage.setItem(LIBRARY_KEY, JSON.stringify(all));
      return library;
    } catch {
      return fallback;
    }
  }

  function empty(message) {
    return `<div class="mypage-empty"><i data-lucide="Music2"></i><p>${message}</p></div>`;
  }

  function avatar(item) {
    const initial = clean(item.initial || item.name[0]);
    return item.imageSrc
      ? `<img src="${clean(item.imageSrc)}" alt="${clean(item.name)}" class="mypage-avatar">`
      : `<div class="mypage-avatar purple-soft">${initial}</div>`;
  }

  function userAvatar(user) {
    if (user.profileImage) return `<img src="${clean(user.profileImage)}" alt="${clean(user.name)} 프로필" class="mypage-profile-image">`;
    return `<div class="mypage-profile-initial">${clean(user.name.slice(0, 1).toUpperCase())}</div>`;
  }

  function syncMypageHeaderAvatar(user) {
    const avatar = document.querySelector("[data-header-user]");
    if (!avatar) return;
    avatar.textContent = "";
    if (user?.profileImage) {
      const image = document.createElement("img");
      image.src = user.profileImage;
      image.alt = `${user.name || "사용자"} 프로필`;
      image.style.cssText = "width:100%;height:100%;border-radius:9999px;object-fit:cover";
      avatar.appendChild(image);
    } else {
      avatar.textContent = user?.name?.slice(0, 1).toUpperCase() || "MC";
    }
  }

  function profileEditDialog(user) {
    return `<dialog class="mypage-playlist-dialog mypage-profile-dialog" data-profile-dialog aria-labelledby="profile-edit-title">
      <form data-profile-edit-form>
        <div class="mypage-dialog-head"><div><p class="mypage-eyebrow">EDIT PROFILE</p><h2 id="profile-edit-title">프로필 수정</h2><p>MidnightChord에서 사용할 프로필을 변경하세요.</p></div><button type="button" class="mypage-dialog-close" data-close-profile aria-label="프로필 수정창 닫기"><i data-lucide="X"></i></button></div>
        <div class="mypage-profile-edit-body">
          <div class="mypage-profile-preview" data-profile-preview>${userAvatar(user)}</div>
          <label class="mypage-profile-file"><i data-lucide="Camera"></i><span>프로필 이미지 선택</span><input type="file" name="profileImage" accept="image/png,image/jpeg,image/webp"></label>
          <button type="button" class="mypage-profile-remove ${user.profileImage ? "" : "hidden"}" data-remove-profile-image>기본 이미지로 변경</button>
          <label>이름<input required minlength="2" maxlength="30" name="name" value="${clean(user.name)}"></label>
          <label>이메일<input type="email" value="${clean(user.email)}" readonly aria-readonly="true"></label>
          <p class="mypage-profile-help">PNG, JPG 또는 WEBP 이미지를 선택하면 프로필 크기에 맞게 자동으로 최적화됩니다.</p>
          <p class="mypage-edit-message" data-profile-message aria-live="polite"></p>
          <button type="submit" class="purple-btn mypage-edit-submit">프로필 저장</button>
        </div>
      </form>
    </dialog>`;
  }

  function profileSaveDialog() {
    return `<dialog class="mypage-profile-saved-dialog" data-profile-saved-dialog aria-labelledby="profile-saved-title">
      <div class="mypage-profile-saved-icon"><i data-lucide="CircleCheck"></i></div>
      <p class="mypage-eyebrow">PROFILE UPDATED</p>
      <h2 id="profile-saved-title">프로필이 저장되었습니다</h2>
      <p>변경한 이름과 프로필 이미지가 마이페이지와 상단 프로필에 적용됩니다.</p>
      <button type="button" class="purple-btn" data-confirm-profile-saved>확인</button>
    </dialog>`;
  }

  function imageDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.addEventListener("load", () => resolve(reader.result));
      reader.addEventListener("error", reject);
      reader.readAsDataURL(file);
    });
  }

  async function optimizedProfileImage(file) {
    const source = await imageDataUrl(file);
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener("load", () => {
        const maxSize = 512;
        const scale = Math.min(1, maxSize / Math.max(image.naturalWidth, image.naturalHeight));
        const width = Math.max(1, Math.round(image.naturalWidth * scale));
        const height = Math.max(1, Math.round(image.naturalHeight * scale));
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const context = canvas.getContext("2d");
        context.drawImage(image, 0, 0, width, height);
        resolve(canvas.toDataURL("image/webp", 0.82));
      }, { once: true });
      image.addEventListener("error", reject, { once: true });
      image.src = source;
    });
  }

  function playlistTracks(item, playlistIndex) {
    if (Array.isArray(item.tracks) && item.tracks.length) return item.tracks;
    const allTracks = (window.trackitData.tracks || []).filter(track => track?.title);
    if (!allTracks.length) return [];
    return Array.from({ length: Math.min(4, allTracks.length) }, (_, index) =>
      allTracks[(playlistIndex * 2 + index) % allTracks.length]
    );
  }

  function playlistDialog(item, playlistIndex) {
    const songs = playlistTracks(item, playlistIndex);
    return `<dialog class="mypage-playlist-dialog" data-playlist-dialog="${playlistIndex}" aria-labelledby="playlist-title-${playlistIndex}">
      <div class="mypage-dialog-head">
        <div><p class="mypage-eyebrow">MY PLAYLIST</p><h2 id="playlist-title-${playlistIndex}">${clean(item.title)}</h2><p>${clean(item.description)}</p></div>
        <button type="button" class="mypage-dialog-close" data-close-playlist aria-label="모달 닫기"><i data-lucide="X"></i></button>
      </div>
      <div class="mypage-dialog-tracks">
        ${songs.length ? songs.map((song, songIndex) => {
          const trackIndex = (window.trackitData.tracks || []).findIndex(track => track.title === song.title && track.artist === song.artist);
          const playAttribute = trackIndex >= 0
            ? `data-play-track="${trackIndex}"`
            : `data-play-library-track="${playlistIndex}:${songIndex}"`;
          return `<button type="button" class="mypage-dialog-track" ${playAttribute}><span class="mypage-dialog-cover"><i data-lucide="Music2"></i></span><span class="min-w-0"><strong>${clean(song.title)}</strong><small>${clean(song.artist)}</small></span><span>${clean(song.time || "--:--")}</span><i data-lucide="Play"></i></button>`;
        }).join("") : empty("플레이리스트에 담긴 곡이 없어요.")}
      </div>
    </dialog>`;
  }

  function editableTracks(item, likes, playlistIndex = 0) {
    const unique = new Map();
    [...playlistTracks(item, playlistIndex), ...(Array.isArray(likes) ? likes : [])].forEach(track => {
      unique.set(`${track.title}::${track.artist}`, track);
    });
    return [...unique.values()];
  }

  function playlistEditDialog(item, playlistIndex, likes) {
    const currentTracks = playlistTracks(item, playlistIndex);
    const available = editableTracks(item, likes, playlistIndex);
    const selected = new Set(currentTracks.map(track => `${track.title}::${track.artist}`));
    return `<dialog class="mypage-playlist-dialog mypage-edit-dialog" data-edit-playlist-dialog="${playlistIndex}" aria-labelledby="edit-playlist-title-${playlistIndex}">
      <form data-edit-playlist-form="${playlistIndex}">
        <div class="mypage-dialog-head"><div><p class="mypage-eyebrow">EDIT PLAYLIST</p><h2 id="edit-playlist-title-${playlistIndex}">플레이리스트 수정</h2></div><button type="button" class="mypage-dialog-close" data-close-playlist aria-label="수정창 닫기"><i data-lucide="X"></i></button></div>
        <div class="mypage-edit-fields">
          <label>플레이리스트 이름<input required minlength="2" maxlength="40" name="title" value="${clean(item.title)}"></label>
          <label>설명<input maxlength="80" name="description" value="${clean(item.description || "")}"></label>
          <fieldset><legend>수록곡 선택 <span>좋아요한 곡에서 추가할 수 있어요.</span></legend><div class="mypage-edit-tracks">${available.length ? available.map((track, index) => `<label><input type="checkbox" name="tracks" value="${index}" ${selected.has(`${track.title}::${track.artist}`) ? "checked" : ""}><span><strong>${clean(track.title)}</strong><small>${clean(track.artist)}</small></span><time>${clean(track.time || "--:--")}</time></label>`).join("") : '<p class="mypage-muted">선택할 수 있는 곡이 없습니다.</p>'}</div></fieldset>
          <p class="mypage-edit-message" data-edit-message aria-live="polite"></p>
          <button type="submit" class="purple-btn mypage-edit-submit">변경사항 저장</button>
        </div>
      </form>
    </dialog>`;
  }

  function playlistDeleteDialog() {
    return `<dialog class="mypage-delete-dialog" data-delete-playlist-dialog aria-labelledby="delete-playlist-title">
      <div class="mypage-delete-icon"><i data-lucide="Trash2"></i></div>
      <div class="mypage-delete-copy">
        <p class="mypage-eyebrow">DELETE PLAYLIST</p>
        <h2 id="delete-playlist-title">플레이리스트를 삭제할까요?</h2>
        <p><strong data-delete-playlist-name></strong> 플레이리스트와 저장된 곡 목록이 마이페이지에서 삭제됩니다.</p>
      </div>
      <div class="mypage-delete-actions">
        <button type="button" data-cancel-delete-playlist>취소</button>
        <button type="button" class="danger" data-confirm-delete-playlist><i data-lucide="Trash2"></i> 삭제</button>
      </div>
    </dialog>`;
  }

  function saveMypageLibrary(user, library) {
    let all = {};
    try { all = JSON.parse(localStorage.getItem(LIBRARY_KEY)) || {}; } catch { all = {}; }
    all[user.email.toLowerCase()] = library;
    localStorage.setItem(LIBRARY_KEY, JSON.stringify(all));
  }

  function refreshMypage() {
    const root = document.querySelector("[data-page-root]");
    if (root && activeMypageUser) root.innerHTML = window.trackitPages.mypage(activeMypageUser, "");
    setTimeout(() => window.lucide?.createIcons(), 0);
  }

  function loginView(error) {
    return `<section class="mypage-auth-shell">
      <div class="mypage-auth-intro">
        <div class="mypage-auth-logo"><i data-lucide="AudioLines"></i></div>
        <p class="mypage-eyebrow">MIDNIGHTCHORD ACCOUNT</p>
        <h1>당신의 음악이 머무는 곳</h1>
        <p>계정에 로그인하고 팔로우한 아티스트, 플레이리스트와 좋아요한 곡을 이어서 감상하세요.</p>
        <div class="mypage-auth-benefits"><span><i data-lucide="Heart"></i> 좋아요 저장</span><span><i data-lucide="ListMusic"></i> 플레이리스트 관리</span><span><i data-lucide="UserRoundPlus"></i> 아티스트 팔로우</span></div>
      </div>
      <div class="surface mypage-auth-card">
        <div class="mypage-auth-tabs" role="tablist" aria-label="계정 메뉴">
          <button type="button" class="active" role="tab" aria-selected="true" data-auth-tab="login">로그인</button>
          <button type="button" role="tab" aria-selected="false" data-auth-tab="register">회원가입</button>
        </div>
        <form class="mypage-auth-form" data-login-form novalidate>
          <div><p class="mypage-eyebrow">WELCOME BACK</p><h2>다시 만나서 반가워요</h2></div>
          <label>이메일<input required type="email" name="email" autocomplete="email" class="mypage-input" placeholder="name@example.com"></label>
          <label>비밀번호<input required type="password" name="password" minlength="6" autocomplete="current-password" class="mypage-input" placeholder="비밀번호 입력"></label>
          <p class="mypage-auth-message ${error ? "error" : ""}" data-auth-message aria-live="polite">${clean(error)}</p>
          <button type="submit" class="purple-btn mypage-auth-submit">로그인</button>
        </form>
        <form class="mypage-auth-form hidden" data-register-form novalidate>
          <div><p class="mypage-eyebrow">CREATE ACCOUNT</p><h2>새로운 음악 여정을 시작하세요</h2></div>
          <label>이름<input required minlength="2" maxlength="30" name="name" autocomplete="name" class="mypage-input" placeholder="이름을 입력하세요"></label>
          <label>이메일<input required type="email" name="email" autocomplete="email" class="mypage-input" placeholder="name@example.com"></label>
          <label>비밀번호<input required type="password" name="password" minlength="8" autocomplete="new-password" class="mypage-input" placeholder="8자 이상 입력"></label>
          <label>비밀번호 확인<input required type="password" name="passwordConfirm" minlength="8" autocomplete="new-password" class="mypage-input" placeholder="비밀번호 다시 입력"></label>
          <p class="mypage-auth-message" data-auth-message aria-live="polite"></p>
          <button type="submit" class="purple-btn mypage-auth-submit">회원가입</button>
        </form>
      </div>
    </section>`;
  }

  function readAccounts() {
    try {
      const accounts = JSON.parse(localStorage.getItem(ACCOUNTS_KEY));
      return accounts && typeof accounts === "object" ? accounts : {};
    } catch {
      return {};
    }
  }

  function bytesToBase64(bytes) {
    return btoa(String.fromCharCode(...bytes));
  }

  async function passwordHash(password, salt) {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, ["deriveBits"]);
    const bits = await crypto.subtle.deriveBits({
      name: "PBKDF2", salt: Uint8Array.from(atob(salt), char => char.charCodeAt(0)), iterations: 120000, hash: "SHA-256"
    }, key, 256);
    return bytesToBase64(new Uint8Array(bits));
  }

  function authMessage(form, message, type = "error") {
    const output = form.querySelector("[data-auth-message]");
    output.textContent = message;
    output.className = `mypage-auth-message ${type}`;
  }

  function setAuthLoading(form, loading) {
    const button = form.querySelector("button[type='submit']");
    button.disabled = loading;
    button.textContent = loading ? "처리 중..." : (form.matches("[data-login-form]") ? "로그인" : "회원가입");
  }

  async function registerAccount(form) {
    const data = new FormData(form);
    const name = String(data.get("name") || "").trim();
    const email = String(data.get("email") || "").trim().toLowerCase();
    const password = String(data.get("password") || "");
    const confirmation = String(data.get("passwordConfirm") || "");
    if (name.length < 2) return authMessage(form, "이름은 2자 이상 입력해주세요.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return authMessage(form, "올바른 이메일 주소를 입력해주세요.");
    if (password.length < 8) return authMessage(form, "비밀번호는 8자 이상 입력해주세요.");
    if (password !== confirmation) return authMessage(form, "비밀번호가 서로 일치하지 않습니다.");
    const accounts = readAccounts();
    if (accounts[email]) return authMessage(form, "이미 가입된 이메일입니다. 로그인해주세요.");
    setAuthLoading(form, true);
    try {
      const salt = bytesToBase64(crypto.getRandomValues(new Uint8Array(16)));
      accounts[email] = { name, email, salt, passwordHash: await passwordHash(password, salt), profileImage: "", likes: [], createdAt: new Date().toISOString() };
      localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
      localStorage.setItem("studio-midnight-user", JSON.stringify({ name, email, profileImage: "", likes: [] }));
      window.location.reload();
    } catch {
      authMessage(form, "계정을 저장하지 못했습니다. 브라우저 저장소를 확인해주세요.");
      setAuthLoading(form, false);
    }
  }

  async function loginAccount(form) {
    const data = new FormData(form);
    const email = String(data.get("email") || "").trim().toLowerCase();
    const password = String(data.get("password") || "");
    const account = readAccounts()[email];
    if (!account) return authMessage(form, "가입되지 않은 이메일입니다.");
    setAuthLoading(form, true);
    try {
      const hash = await passwordHash(password, account.salt);
      if (hash !== account.passwordHash) {
        setAuthLoading(form, false);
        return authMessage(form, "비밀번호가 올바르지 않습니다.");
      }
      if (!Array.isArray(account.likes)) {
        account.likes = [];
        const accounts = readAccounts();
        accounts[email] = account;
        localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
      }
      localStorage.setItem("studio-midnight-user", JSON.stringify({ name: account.name, email: account.email, profileImage: account.profileImage || "", likes: account.likes }));
      window.location.reload();
    } catch {
      authMessage(form, "로그인 처리 중 문제가 발생했습니다.");
      setAuthLoading(form, false);
    }
  }

  window.trackitPages.mypage = (user, error = "") => {
    if (!user) {
      setTimeout(() => window.lucide?.createIcons(), 0);
      setTimeout(() => syncMypageHeaderAvatar(null), 0);
      return loginView(error);
    }
    activeMypageUser = user;
    setTimeout(() => window.lucide?.createIcons(), 0);
    setTimeout(() => syncMypageHeaderAvatar(user), 0);
    const library = getLibrary(user);
    const follows = Array.isArray(library.follows) ? library.follows : [];
    const playlists = Array.isArray(library.playlists) ? library.playlists : [];
    const likes = Array.isArray(library.likes) ? library.likes : [];
    return `<section class="surface rounded-3xl p-5 md:p-7 mypage-profile">
      ${userAvatar(user)}
      <div class="flex-1 min-w-0"><p class="mypage-eyebrow">MIDNIGHT LISTENER</p><h1 class="text-2xl font-medium mt-1 truncate">${clean(user.name)}</h1><p class="text-sm mt-2 mypage-muted truncate">${clean(user.email)}</p></div>
      <div class="mypage-profile-actions"><button type="button" class="purple-btn rounded-xl px-4 py-2" data-open-profile><i data-lucide="Pencil"></i> 프로필 수정</button><button type="button" class="surface rounded-xl px-4 py-2" data-logout>로그아웃</button></div></section>
      <div class="mypage-metrics">
        <button type="button" class="metric-card ${activeLibraryTab === "follows" ? "active" : ""}" data-library-tab="follows" aria-selected="${activeLibraryTab === "follows"}"><i data-lucide="UserRoundPlus"></i><span>팔로우</span><strong>${follows.length}</strong></button>
        <button type="button" class="metric-card ${activeLibraryTab === "playlists" ? "active" : ""}" data-library-tab="playlists" aria-selected="${activeLibraryTab === "playlists"}"><i data-lucide="ListMusic"></i><span>플레이리스트</span><strong>${playlists.length}</strong></button>
        <button type="button" class="metric-card ${activeLibraryTab === "likes" ? "active" : ""}" data-library-tab="likes" aria-selected="${activeLibraryTab === "likes"}"><i data-lucide="Heart"></i><span>좋아요</span><strong>${likes.length}</strong></button></div>
      <section id="my-follows" data-library-panel="follows" ${activeLibraryTab !== "follows" ? "hidden" : ""} class="surface rounded-2xl p-4 md:p-5 mypage-section"><div class="mypage-section-title"><div><p class="mypage-eyebrow">FOLLOWING</p><h2>팔로우한 아티스트</h2></div><span>${follows.length}명</span></div>
        ${follows.length ? `<div class="mypage-artist-grid">${follows.map(item => `<article class="mypage-artist-card"><button type="button" class="mypage-artist-link" data-artist-name="${clean(item.name)}" aria-label="${clean(item.name)} 아티스트 페이지로 이동">${avatar(item)}<div class="min-w-0"><h3>${clean(item.name)}</h3><p>${clean(item.genre || "Artist")}</p></div><i data-lucide="ChevronRight" class="mypage-artist-arrow"></i></button><button type="button" class="mypage-unfollow" data-unfollow-artist="${clean(item.name)}" aria-label="${clean(item.name)} 팔로우 취소"><i data-lucide="UserRoundMinus"></i></button></article>`).join("")}</div>` : empty("아직 팔로우한 아티스트가 없어요.")}</section>
      <section id="my-playlists" data-library-panel="playlists" ${activeLibraryTab !== "playlists" ? "hidden" : ""} class="surface rounded-2xl p-4 md:p-5 mypage-section"><div class="mypage-section-title"><div><p class="mypage-eyebrow">PLAYLISTS</p><h2>내 플레이리스트</h2></div><span>${playlists.length}개</span></div>
        ${playlists.length ? `<div class="mypage-playlist-grid">${playlists.map((item, index) => `<article class="mypage-playlist-card"><button type="button" class="mypage-playlist-main" data-open-playlist="${index}" aria-label="${clean(item.title)} 곡 목록 열기"><div class="mypage-playlist-cover"><i data-lucide="${clean(item.icon || "Music")}"></i><span class="mypage-playlist-open"><i data-lucide="ListMusic"></i></span></div><h3>${clean(item.title)}</h3><p>${clean(item.description)}</p><span>${Array.isArray(item.tracks) ? item.tracks.length : Number(item.count) || 0}곡</span></button><div class="mypage-playlist-actions"><button type="button" data-edit-playlist="${index}"><i data-lucide="Pencil"></i> 수정</button><button type="button" class="danger" data-delete-playlist="${index}"><i data-lucide="Trash2"></i> 삭제</button></div></article>`).join("")}</div>${playlists.map(playlistDialog).join("")}${playlists.map((item, index) => playlistEditDialog(item, index, likes)).join("")}` : empty("아직 만든 플레이리스트가 없어요.")}</section>
      <section id="my-likes" data-library-panel="likes" ${activeLibraryTab !== "likes" ? "hidden" : ""} class="surface rounded-2xl p-4 md:p-5 mypage-section"><div class="mypage-section-title"><div><p class="mypage-eyebrow">LIKED TRACKS</p><h2>좋아요한 곡</h2></div><span>${likes.length}곡</span></div>
        ${likes.length ? `<div class="mypage-track-list">${likes.map((item, index) => {
          const trackIndex = (window.trackitData.tracks || []).findIndex(track => track.title === item.title && track.artist === item.artist);
          const playAttribute = trackIndex >= 0 ? `data-track-index="${trackIndex}"` : `data-play-liked-track="${index}"`;
          const likeAttribute = trackIndex >= 0 ? `data-like-track="${trackIndex}"` : `data-remove-liked-track="${index}"`;
          return `<div role="button" tabindex="0" class="mypage-track" ${playAttribute}><span class="mypage-track-number">${String(index + 1).padStart(2, "0")}</span><span class="min-w-0"><strong>${clean(item.title)}</strong><small>${clean(item.artist)}</small></span><span class="mypage-track-time">${clean(item.time || "--:--")}</span><i data-lucide="Play"></i><button type="button" class="track-like-button is-liked" ${likeAttribute} aria-label="${clean(item.title)} 좋아요 취소"><i data-lucide="Heart" class="w-4 h-4 fill-current"></i></button></div>`;
        }).join("")}</div>` : empty("아직 좋아요한 곡이 없어요.")}</section>${profileEditDialog(user)}${profileSaveDialog()}${playlistDeleteDialog()}`;
  };

  document.addEventListener("click", event => {
    const likedTrackButton = event.target.closest("[data-play-liked-track]");
    if (likedTrackButton && activeMypageUser && !event.target.closest("[data-remove-liked-track]")) {
      const library = getLibrary(activeMypageUser);
      const song = library.likes[Number(likedTrackButton.dataset.playLikedTrack)];
      if (!song) return;
      const targetIndex = window.trackitData.tracks.push({ ...song }) - 1;
      if (typeof playTrackByIndex === "function") playTrackByIndex(targetIndex);
      return;
    }

    const removeLikedButton = event.target.closest("[data-remove-liked-track]");
    if (removeLikedButton && activeMypageUser) {
      const index = Number(removeLikedButton.dataset.removeLikedTrack);
      const accounts = readAccounts();
      const userKey = activeMypageUser.email.toLowerCase();
      if (accounts[userKey] && Array.isArray(accounts[userKey].likes)) {
        accounts[userKey].likes.splice(index, 1);
        localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
      }
      const library = getLibrary(activeMypageUser);
      library.likes.splice(index, 1);
      saveMypageLibrary(activeMypageUser, library);
      activeMypageUser.likes = library.likes;
      localStorage.setItem("studio-midnight-user", JSON.stringify(activeMypageUser));
      activeLibraryTab = "likes";
      refreshMypage();
      return;
    }

    const libraryTrackButton = event.target.closest("[data-play-library-track]");
    if (libraryTrackButton && activeMypageUser) {
      const [playlistIndex, songIndex] = libraryTrackButton.dataset.playLibraryTrack.split(":").map(Number);
      const library = getLibrary(activeMypageUser);
      const song = playlistTracks(library.playlists[playlistIndex] || {}, playlistIndex)[songIndex];
      if (!song) return;
      const existingIndex = (window.trackitData.tracks || []).findIndex(track =>
        track.title === song.title && track.artist === song.artist
      );
      const targetIndex = existingIndex >= 0
        ? existingIndex
        : window.trackitData.tracks.push({ ...song }) - 1;
      if (typeof playTrackByIndex === "function") playTrackByIndex(targetIndex);
      return;
    }

    const libraryTab = event.target.closest("[data-library-tab]");
    if (libraryTab) {
      activeLibraryTab = libraryTab.dataset.libraryTab;
      document.querySelectorAll("[data-library-tab]").forEach(tab => {
        const active = tab.dataset.libraryTab === activeLibraryTab;
        tab.classList.toggle("active", active);
        tab.setAttribute("aria-selected", String(active));
      });
      document.querySelectorAll("[data-library-panel]").forEach(panel => {
        panel.hidden = panel.dataset.libraryPanel !== activeLibraryTab;
      });
      return;
    }

    const unfollowButton = event.target.closest("[data-unfollow-artist]");
    if (unfollowButton && activeMypageUser) {
      const allFollowing = (() => {
        try { return JSON.parse(localStorage.getItem(FOLLOWING_KEY)) || {}; } catch { return {}; }
      })();
      const userKey = activeMypageUser.email.toLowerCase();
      allFollowing[userKey] = (Array.isArray(allFollowing[userKey]) ? allFollowing[userKey] : [])
        .filter(item => item.name !== unfollowButton.dataset.unfollowArtist);
      localStorage.setItem(FOLLOWING_KEY, JSON.stringify(allFollowing));
      window.dispatchEvent(new CustomEvent("studio-midnight:following-changed", {
        detail: { userKey, artist: unfollowButton.dataset.unfollowArtist, followed: false }
      }));
      activeLibraryTab = "follows";
      refreshMypage();
      return;
    }

    if (event.target.closest("[data-open-profile]")) {
      pendingProfileImage = activeMypageUser?.profileImage || "";
      shouldRemoveProfileImage = false;
      document.querySelector("[data-profile-dialog]")?.showModal();
      setTimeout(() => window.lucide?.createIcons(), 0);
      return;
    }

    if (event.target.closest("[data-close-profile]")) {
      event.target.closest("dialog")?.close();
      return;
    }

    if (event.target.closest("[data-confirm-profile-saved]")) {
      window.location.reload();
      return;
    }

    if (event.target.closest("[data-remove-profile-image]")) {
      const form = event.target.closest("form");
      shouldRemoveProfileImage = true;
      pendingProfileImage = "";
      form.querySelector('input[name="profileImage"]').value = "";
      form.querySelector("[data-profile-preview]").innerHTML = `<div class="mypage-profile-initial">${clean(form.elements.name.value.slice(0, 1).toUpperCase() || "U")}</div>`;
      event.target.closest("[data-remove-profile-image]").classList.add("hidden");
      return;
    }

    const editPlaylist = event.target.closest("[data-edit-playlist]");
    if (editPlaylist) {
      document.querySelector(`[data-edit-playlist-dialog="${editPlaylist.dataset.editPlaylist}"]`)?.showModal();
      setTimeout(() => window.lucide?.createIcons(), 0);
      return;
    }

    const deletePlaylist = event.target.closest("[data-delete-playlist]");
    if (deletePlaylist && activeMypageUser) {
      const library = getLibrary(activeMypageUser);
      const index = Number(deletePlaylist.dataset.deletePlaylist);
      const playlist = library.playlists[index];
      if (!playlist) return;
      pendingDeletePlaylistIndex = index;
      const dialog = document.querySelector("[data-delete-playlist-dialog]");
      dialog.querySelector("[data-delete-playlist-name]").textContent = `“${playlist.title}”`;
      dialog.showModal();
      setTimeout(() => window.lucide?.createIcons(), 0);
      return;
    }

    if (event.target.closest("[data-cancel-delete-playlist]")) {
      pendingDeletePlaylistIndex = null;
      event.target.closest("dialog")?.close();
      return;
    }

    if (event.target.closest("[data-confirm-delete-playlist]") && activeMypageUser) {
      const library = getLibrary(activeMypageUser);
      if (pendingDeletePlaylistIndex !== null && library.playlists[pendingDeletePlaylistIndex]) {
        library.playlists.splice(pendingDeletePlaylistIndex, 1);
        saveMypageLibrary(activeMypageUser, library);
      }
      pendingDeletePlaylistIndex = null;
      document.querySelector("[data-delete-playlist-dialog]")?.close();
      activeLibraryTab = "playlists";
      refreshMypage();
      return;
    }

    const authTab = event.target.closest("[data-auth-tab]");
    if (authTab) {
      const selected = authTab.dataset.authTab;
      document.querySelectorAll("[data-auth-tab]").forEach(tab => {
        const active = tab.dataset.authTab === selected;
        tab.classList.toggle("active", active);
        tab.setAttribute("aria-selected", String(active));
      });
      document.querySelector("[data-login-form]")?.classList.toggle("hidden", selected !== "login");
      document.querySelector("[data-register-form]")?.classList.toggle("hidden", selected !== "register");
      document.querySelector(`[data-${selected}-form] input`)?.focus();
      return;
    }

    const openButton = event.target.closest("[data-open-playlist]");
    if (openButton) {
      const dialog = document.querySelector(`[data-playlist-dialog="${openButton.dataset.openPlaylist}"]`);
      if (dialog) {
        dialog.showModal();
        setTimeout(() => window.lucide?.createIcons(), 0);
      }
      return;
    }

    const closeButton = event.target.closest("[data-close-playlist]");
    if (closeButton) closeButton.closest("dialog")?.close();
    if (event.target.matches("[data-playlist-dialog]")) event.target.close();
    if (event.target.matches("[data-profile-dialog]")) event.target.close();
    if (event.target.matches("[data-delete-playlist-dialog]")) {
      pendingDeletePlaylistIndex = null;
      event.target.close();
    }
  });

  document.addEventListener("submit", async event => {
    if (event.target.matches("[data-profile-edit-form]")) {
      event.preventDefault();
      if (!activeMypageUser) return;
      const form = event.target;
      const name = form.elements.name.value.trim();
      const file = form.elements.profileImage.files[0];
      const message = form.querySelector("[data-profile-message]");
      if (name.length < 2) { message.textContent = "이름을 2자 이상 입력해주세요."; return; }
      if (file && !["image/png", "image/jpeg", "image/webp"].includes(file.type)) { message.textContent = "PNG, JPG 또는 WEBP 이미지만 사용할 수 있습니다."; return; }
      if (file && file.size > 10 * 1024 * 1024) { message.textContent = "이미지 크기는 10MB 이하여야 합니다."; return; }
      const saveButton = form.querySelector("button[type='submit']");
      saveButton.disabled = true;
      saveButton.textContent = "저장 중...";
      try {
        const accounts = readAccounts();
        const userKey = activeMypageUser.email.toLowerCase();
        const account = accounts[userKey] || { email: activeMypageUser.email, likes: activeMypageUser.likes || [] };
        let profileImage = shouldRemoveProfileImage ? "" : (pendingProfileImage ?? account.profileImage ?? activeMypageUser.profileImage ?? "");
        if (file && !pendingProfileImage) profileImage = await optimizedProfileImage(file);
        account.name = name;
        account.profileImage = profileImage;
        account.profileUpdatedAt = Date.now();
        accounts[userKey] = account;
        const updatedUser = { ...activeMypageUser, name, profileImage, profileUpdatedAt: account.profileUpdatedAt };
        localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
        localStorage.setItem("studio-midnight-user", JSON.stringify(updatedUser));
        activeMypageUser = updatedUser;
        form.closest("dialog")?.close();
        const savedDialog = document.querySelector("[data-profile-saved-dialog]");
        savedDialog?.addEventListener("cancel", cancelEvent => cancelEvent.preventDefault(), { once: true });
        savedDialog?.showModal();
        setTimeout(() => window.lucide?.createIcons(), 0);
      } catch (saveError) {
        console.error("Profile save failed", saveError);
        message.textContent = saveError?.name === "QuotaExceededError"
          ? "브라우저 저장 공간이 부족합니다. 더 작은 이미지를 선택해주세요."
          : "프로필 이미지를 저장하지 못했습니다. 다시 시도해주세요.";
        saveButton.disabled = false;
        saveButton.textContent = "프로필 저장";
      }
      return;
    }

    if (event.target.matches("[data-edit-playlist-form]")) {
      event.preventDefault();
      if (!activeMypageUser) return;
      const form = event.target;
      const index = Number(form.dataset.editPlaylistForm);
      const library = getLibrary(activeMypageUser);
      const playlist = library.playlists[index];
      if (!playlist) return;
      const data = new FormData(form);
      const title = String(data.get("title") || "").trim();
      const message = form.querySelector("[data-edit-message]");
      if (title.length < 2) { message.textContent = "이름을 2자 이상 입력해주세요."; return; }
      const available = editableTracks(playlist, library.likes, index);
      const selectedTracks = data.getAll("tracks").map(Number).map(trackIndex => available[trackIndex]).filter(Boolean);
      if (!selectedTracks.length) { message.textContent = "곡을 한 개 이상 선택해주세요."; return; }
      playlist.title = title;
      playlist.description = String(data.get("description") || "").trim();
      playlist.tracks = selectedTracks;
      playlist.count = selectedTracks.length;
      saveMypageLibrary(activeMypageUser, library);
      form.closest("dialog").close();
      activeLibraryTab = "playlists";
      refreshMypage();
      return;
    }

    if (event.target.matches("[data-login-form]")) {
      event.preventDefault();
      loginAccount(event.target);
    }
    if (event.target.matches("[data-register-form]")) {
      event.preventDefault();
      registerAccount(event.target);
    }
  });

  document.addEventListener("change", event => {
    if (!event.target.matches('input[name="profileImage"]')) return;
    const file = event.target.files[0];
    if (!file || !file.type.startsWith("image/")) return;
    const form = event.target.closest("form");
    pendingProfileImage = null;
    shouldRemoveProfileImage = false;
    if (file.size > 10 * 1024 * 1024) {
      form.querySelector("[data-profile-message]").textContent = "이미지 크기는 10MB 이하여야 합니다.";
      event.target.value = "";
      return;
    }
    form.querySelector("[data-profile-message]").textContent = "이미지를 최적화하는 중입니다...";
    optimizedProfileImage(file).then(url => {
      shouldRemoveProfileImage = false;
      pendingProfileImage = url;
      form.querySelector("[data-profile-preview]").innerHTML = `<img src="${clean(url)}" alt="선택한 프로필 미리보기" class="mypage-profile-image">`;
      form.querySelector("[data-remove-profile-image]").classList.remove("hidden");
      form.querySelector("[data-profile-message]").textContent = "";
    }).catch(() => {
      form.querySelector("[data-profile-message]").textContent = "이미지를 불러오지 못했습니다. 다른 이미지를 선택해주세요.";
      event.target.value = "";
    });
  });

  document.addEventListener("keydown", event => {
    if (!event.target.matches(".mypage-track[role='button']")) return;
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    event.target.click();
  });
})();
