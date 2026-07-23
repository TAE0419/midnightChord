/* 아티스트 목록 페이지 전용 렌더링 */
(() => {
  const artists = window.artistPageData.artists;
  const tracks = window.trackitData.tracks;

  function artistIcon(name, className = "w-4 h-4") {
    return `<i data-lucide="${name}" class="${className}"></i>`;
  }

  function artistImage(artist) {
    const classes = "w-14 h-14 rounded-full";
    if (artist.imageSrc) {
      return `<img src="${artist.imageSrc}" alt="${artist.name}" class="${classes} object-cover" onerror="this.replaceWith(Object.assign(document.createElement('div'), { className: '${classes} purple-soft flex items-center justify-center text-4xl', textContent: '${artist.initial}' }))">`;
    }
    return `<div class="${classes} purple-soft flex items-center justify-center text-4xl">${artist.initial}</div>`;
  }

  function renderMyArtists() {
    return `
      <div>
        <p class="text-sm" style="color:var(--muted)">ARTISTS</p>
        <h1 class="text-2xl font-medium mt-1">아티스트</h1>
      </div>
      <div class="grid md:grid-cols-2 gap-4">
        ${artists.map((artist, index) => `
          <article class="artist-card surface rounded-2xl p-4 flex items-center gap-4" data-artist-search="${artist.name.toLocaleLowerCase()}">
            <!-- 프로필 이미지를 누르면 해당 아티스트 상세 페이지로 이동합니다. -->
            <a class="artist-profile-link shrink-0 rounded-full" href="pages/artist-detail/?name=${encodeURIComponent(artist.name)}" aria-label="${artist.name} 상세 페이지 보기">
              ${artistImage(artist)}
            </a>
            <div class="artist-card-meta flex-1">
              <p class="font-medium">${artist.name}</p>
              <p class="text-sm" style="color:var(--muted)">${artist.plays}</p>
            </div>

            <!-- 아티스트 카드의 미니 음악 재생바 -->
            <button type="button" class="artist-mini-player" data-personal-artist-audio="${index}" aria-label="아티스트 음악 재생">
              <span class="artist-mini-line" aria-hidden="true">
                <svg class="artist-wave" viewBox="0 0 180 30" preserveAspectRatio="none">
                  <path d="M0 15 L180 15"></path>
                </svg>
              </span>
              <span class="artist-mini-play" aria-hidden="true">
                ${artistIcon("Play", "artist-mini-icon artist-mini-icon-play w-4 h-4")}
                ${artistIcon("Pause", "artist-mini-icon artist-mini-icon-pause w-4 h-4")}
              </span>
            </button>

            <button type="button" class="surface rounded-xl px-3 py-2 text-sm" data-artist-name="${artist.name}">소개 보기</button>
          </article>
        `).join("")}
      </div>
      <p class="artist-search-empty surface rounded-2xl p-6 text-center" data-artist-search-empty hidden>
        검색 결과가 없습니다.
      </p>
      <button type="button" class="artist-top-button" data-artist-top aria-label="페이지 맨 위로 이동">TOP</button>
      <button type="button" class="artist-bottom-button" data-artist-bottom aria-label="페이지 맨 아래로 이동">▼</button>
    `;
  }

  // 공용 렌더러 중 아티스트 목록만 개인 렌더러로 교체합니다.
  window.trackitPages.artists = renderMyArtists;

  // 공용 검색 페이지로 이동하지 않고 현재 아티스트 목록 안에서만 검색합니다.
  document.addEventListener("trackit:ready", () => {
    const searchInput = document.querySelector("[data-search-input]");
    if (!searchInput) return;

    searchInput.placeholder = "아티스트 이름 검색";

    // trackit-app.js가 검색 페이지로 이동시키는 focus 이벤트보다 먼저 실행됩니다.
    searchInput.addEventListener("focus", event => {
      event.stopImmediatePropagation();
    }, true);

    searchInput.addEventListener("input", () => {
      const query = searchInput.value.trim().toLocaleLowerCase();
      const cards = [...document.querySelectorAll("[data-artist-search]")];
      let visibleCount = 0;

      cards.forEach(card => {
        const matched = !query || card.dataset.artistSearch.includes(query);
        card.hidden = !matched;
        if (matched) visibleCount += 1;
      });

      const emptyMessage = document.querySelector("[data-artist-search-empty]");
      if (emptyMessage) emptyMessage.hidden = visibleCount !== 0;
    });
  });

  let selectedAudioButton = null;
  let selectedArtist = null;

  function stopArtistAudioButton(button) {
    if (!button) return;
    if (typeof window.setArtistWave === "function") {
      window.setArtistWave(null, false);
    }
    // 공용 함수 동작 여부와 관계없이 버튼의 모든 재생 상태를 직접 제거합니다.
    button.classList.remove("is-wave-active", "is-playing");
    const playIcon = button.querySelector(".artist-mini-icon-play");
    const pauseIcon = button.querySelector(".artist-mini-icon-pause");
    if (playIcon) playIcon.style.display = "block";
    if (pauseIcon) pauseIcon.style.display = "none";
    button.setAttribute("aria-label", "아티스트 음악 재생");
  }

  function startArtistAudioButton(button) {
    if (!button) return;
    if (typeof window.setArtistWave === "function") {
      window.setArtistWave(button, true);
    } else {
      button.classList.add("is-wave-active");
    }
    button.classList.add("is-wave-active");
    const playIcon = button.querySelector(".artist-mini-icon-play");
    const pauseIcon = button.querySelector(".artist-mini-icon-pause");
    if (playIcon) playIcon.style.display = "none";
    if (pauseIcon) pauseIcon.style.display = "block";
    button.setAttribute("aria-label", "아티스트 음악 일시정지");
  }

  function isSelectedArtistAudio(audio) {
    if (!selectedArtist) return false;
    const selectedUrl = new URL(selectedArtist.audio, document.baseURI).href;
    return audio.currentSrc === selectedUrl || audio.src === selectedUrl;
  }

  // 개인 데이터의 audio 주소를 하단 공용 <audio> 요소에 연결합니다.
  document.addEventListener("click", event => {
    if (event.target.closest("[data-artist-bottom]")) {
      window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "smooth" });
      return;
    }

    if (event.target.closest("[data-artist-top]")) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    const button = event.target.closest("[data-personal-artist-audio]");
    if (!button) return;

    const artistIndex = Number(button.dataset.personalArtistAudio);
    const artist = artists[artistIndex];
    const audio = document.getElementById("studioAudio");
    if (!artist || !artist.audio || !audio) return;

    // 같은 카드 버튼은 실제 audio 상태에 따라 재생/일시정지를 토글합니다.
    if (selectedAudioButton === button && isSelectedArtistAudio(audio)) {
      if (audio.paused) {
        audio.play().then(() => startArtistAudioButton(button)).catch(() => {
          stopArtistAudioButton(button);
        });
      } else {
        audio.pause();
        stopArtistAudioButton(button);
      }
      return;
    }

    stopArtistAudioButton(selectedAudioButton);
    selectedAudioButton = button;
    selectedArtist = artist;

    const artistAudioUrl = new URL(artist.audio, document.baseURI).href;
    if (audio.src !== artistAudioUrl) {
      audio.src = artistAudioUrl;
      audio.load();
    }

    // 하단 플레이어에도 현재 선택한 아티스트 정보를 표시합니다.
    document.getElementById("playerTitle").textContent = `${artist.name} Sample`;
    document.getElementById("playerArtist").textContent = artist.name;
    document.querySelector("[data-sidebar-player-title]").textContent = artist.name;

    audio.play().then(() => startArtistAudioButton(button)).catch(() => {
      stopArtistAudioButton(button);
      selectedAudioButton = null;
      selectedArtist = null;
      document.getElementById("playerStatus").textContent = "온라인 음원을 불러오지 못했습니다.";
    });
  });

  // 카드 클릭뿐 아니라 하단 플레이어의 재생/정지 상태도 버튼과 동기화합니다.
  document.addEventListener("trackit:ready", () => {
    const audio = document.getElementById("studioAudio");
    if (!audio) return;

    audio.addEventListener("play", () => {
      if (selectedAudioButton && isSelectedArtistAudio(audio)) {
        startArtistAudioButton(selectedAudioButton);
      }
    });

    audio.addEventListener("pause", () => {
      stopArtistAudioButton(selectedAudioButton);
    });

    // 음원 오류나 소스 교체로 재생이 중단되어도 버튼을 정지 상태로 복구합니다.
    ["error", "abort", "emptied"].forEach(eventName => {
      audio.addEventListener(eventName, () => {
        stopArtistAudioButton(selectedAudioButton);
      });
    });

    audio.addEventListener("ended", event => {
      event.stopImmediatePropagation();
      stopArtistAudioButton(selectedAudioButton);
      selectedAudioButton = null;
      selectedArtist = null;
    });
  });
})();
