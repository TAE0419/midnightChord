/* 아티스트 상세 페이지 전용 렌더링 */
(() => {
  const artists = window.artistPageData.artists;
  const tracks = window.trackitData.tracks;
  const FOLLOWING_KEY = "studio-midnight-following";
  const LIBRARY_KEY = "studio-midnight-mypage-library";

  function currentUser() {
    try { return JSON.parse(localStorage.getItem("studio-midnight-user")); } catch { return null; }
  }

  function followingByUser() {
    try { return JSON.parse(localStorage.getItem(FOLLOWING_KEY)) || {}; } catch { return {}; }
  }

  function isFollowing(artistName) {
    const user = currentUser();
    const list = user?.email ? followingByUser()[user.email.toLowerCase()] : [];
    return Array.isArray(list) && list.some(item => item.name === artistName);
  }

  function saveFollowing(user, artist, followed) {
    const userKey = user.email.toLowerCase();
    const allFollowing = followingByUser();
    const previous = Array.isArray(allFollowing[userKey]) ? allFollowing[userKey] : [];
    allFollowing[userKey] = followed
      ? [...previous.filter(item => item.name !== artist.name), {
          name: artist.name,
          initial: artist.initial || artist.name.slice(0, 1),
          imageSrc: artist.imageSrc || "",
          genre: artist.genre || "Artist"
        }]
      : previous.filter(item => item.name !== artist.name);
    localStorage.setItem(FOLLOWING_KEY, JSON.stringify(allFollowing));

    let libraries = {};
    try { libraries = JSON.parse(localStorage.getItem(LIBRARY_KEY)) || {}; } catch { libraries = {}; }
    libraries[userKey] = libraries[userKey] || { follows: [], playlists: [], likes: [] };
    libraries[userKey].follows = allFollowing[userKey];
    localStorage.setItem(LIBRARY_KEY, JSON.stringify(libraries));
    window.dispatchEvent(new CustomEvent("studio-midnight:following-changed", {
      detail: { userKey, artist: artist.name, followed }
    }));
  }

  function detailIcon(name, className = "w-4 h-4") {
    return `<i data-lucide="${name}" class="${className}"></i>`;
  }

  function detailArtistImage(artist) {
    const classes = "artist-detail-profile-image rounded-full aspect-square max-w-[150px] w-full mx-auto";
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
    const followed = isFollowing(artist.name);
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
            <button type="button" class="artist-detail-play purple-btn" data-personal-detail-audio="${artists.indexOf(artist)}" aria-label="인기곡 재생">
              <span>인기곡재생</span>${detailIcon("Play")}
            </button>
            <button type="button" class="artist-follow surface rounded-xl px-4 py-2 ${followed ? "is-following" : ""}" data-personal-follow="${artists.indexOf(artist)}" aria-pressed="${followed}" aria-label="${followed ? "팔로우 취소" : "팔로우"}">${followed ? "❤️ 팔로잉" : "팔로우"}</button>
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
      <div class="artist-detail-back-wrap">
        <button type="button" class="artist-detail-back" data-artist-detail-back>${detailIcon("ArrowLeft")} 뒤로</button>
      </div>
    `;
  }

  // 공용 렌더러 중 아티스트 상세만 개인 렌더러로 교체합니다.
  window.trackitPages.artistDetail = renderMyArtistDetail;

  let activeDetailButton = null;

  document.addEventListener("click", event => {
    if (!event.target.closest("[data-artist-detail-back]")) return;
    if (new URLSearchParams(window.location.search).get("returnTo") === "playlist") {
      window.location.href = "pages/playlist/?modal=1";
      return;
    }
    if (window.history.length > 1) {
      window.history.back();
      return;
    }
    window.location.href = "pages/artists/";
  });

  function updateDetailButton(button, playing) {
    if (!button) return;
    button.classList.toggle("is-playing", playing);
    button.innerHTML = `<span>인기곡재생</span>${detailIcon(playing ? "Pause" : "Play")}`;
    button.setAttribute("aria-label", playing ? "인기곡 일시정지" : "인기곡 재생");
    // 실제 재생 상태와 프로필 이미지 회전 상태를 함께 맞춥니다.
    const profileImage = document.querySelector(".artist-detail-profile-image");
    if (profileImage) profileImage.classList.toggle("is-spinning", playing);
    if (window.lucide) window.lucide.createIcons();
  }

  // 팔로우 버튼을 누르면 글자를 빨간 하트로 바꿉니다.
  document.addEventListener("click", event => {
    const button = event.target.closest("[data-personal-follow]");
    if (!button) return;

    const user = currentUser();
    if (!user?.email) {
      alert("팔로우하려면 먼저 로그인해주세요.");
      window.location.href = new URL("pages/mypage/", document.baseURI).href;
      return;
    }
    const artist = artists[Number(button.dataset.personalFollow)];
    if (!artist) return;
    const followed = button.getAttribute("aria-pressed") !== "true";
    saveFollowing(user, artist, followed);
    button.setAttribute("aria-pressed", String(followed));
    button.classList.toggle("is-following", followed);
    button.textContent = followed ? "❤️ 팔로잉" : "팔로우";
    button.setAttribute("aria-label", followed ? "팔로우 취소" : "팔로우");

    // 누를 때마다 젤리 애니메이션을 처음부터 한 번 다시 실행합니다.
    button.classList.remove("jello-horizontal");
    void button.offsetWidth;
    button.classList.add("jello-horizontal");
    button.addEventListener("animationend", () => {
      button.classList.remove("jello-horizontal");
    }, { once: true });
  });

  // 상세 페이지에서 현재 아티스트의 audio 주소를 하단 <audio>에 연결합니다.
  document.addEventListener("click", event => {
    const button = event.target.closest("[data-personal-detail-audio]");
    if (!button) return;

    const artistIndex = Number(button.dataset.personalDetailAudio);
    const artist = artists[artistIndex];
    const audio = document.getElementById("studioAudio");
    if (!artist || !artist.audio || !audio) return;

    if (activeDetailButton === button && !audio.paused) {
      audio.pause();
      updateDetailButton(button, false);
      return;
    }

    updateDetailButton(activeDetailButton, false);
    activeDetailButton = button;
    updateDetailButton(button, true);

    const preferredArtistAudio = typeof window.preferredStudioAudioSource === "function"
      ? window.preferredStudioAudioSource(artist.audio)
      : artist.audio;
    if (audio.src !== preferredArtistAudio) {
      audio.src = preferredArtistAudio;
      audio.load();
    }

    document.getElementById("playerTitle").textContent = `${artist.name} Sample`;
    document.getElementById("playerArtist").textContent = artist.name;
    document.querySelector("[data-sidebar-player-title]").textContent = artist.name;
    document.getElementById("playerStatus").textContent = "온라인 샘플 음악 재생 중";

    audio.play().catch(() => {
      updateDetailButton(button, false);
      activeDetailButton = null;
      document.getElementById("playerStatus").textContent = "온라인 음원을 불러오지 못했습니다.";
    });
  });

  // 하단 플레이어로 재생/정지해도 버튼과 프로필 회전 상태를 동기화합니다.
  document.addEventListener("trackit:ready", () => {
    const audio = document.getElementById("studioAudio");
    if (!audio) return;

    audio.addEventListener("play", () => {
      updateDetailButton(activeDetailButton, true);
    });

    audio.addEventListener("pause", () => {
      updateDetailButton(activeDetailButton, false);
    });

    audio.addEventListener("ended", event => {
      event.stopImmediatePropagation();
      updateDetailButton(activeDetailButton, false);
      activeDetailButton = null;
    });

    audio.addEventListener("error", () => {
      updateDetailButton(activeDetailButton, false);
    });
  });
})();
