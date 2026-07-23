let podcastEpisodePage = 1;
const podcastEpisodesPerPage = 5;
let selectedPodcastSeriesId = "";
let featuredEpisodeIndex = 0;
let featuredEpisodeCount = 0;
const featuredEpisodeLimit = 5;

function renderPodcasts() {
  const globalData = window.trackitData || {};
  const podcastData = window.trackitPodcastData || {};
  const tracks = globalData.tracks || podcastData.tracks || [];
  const podcastSeries = podcastData.podcastSeries || globalData.podcastSeries || [];
  const seriesList = podcastSeries.length ? podcastSeries : [];
  const featured = seriesList.find(series => series.isFeatured) || seriesList[0];
  const allEpisodes = seriesList.flatMap(series => series.episodes.map(episode => ({ ...episode, series })));
  const selectedSeries = seriesList.find(series => series.id === selectedPodcastSeriesId);
  const filteredEpisodes = selectedSeries
    ? allEpisodes.filter(episode => episode.series.id === selectedSeries.id)
    : allEpisodes;
  const totalPages = Math.max(1, Math.ceil(filteredEpisodes.length / podcastEpisodesPerPage));
  podcastEpisodePage = Math.min(Math.max(1, podcastEpisodePage), totalPages);
  const pageStart = (podcastEpisodePage - 1) * podcastEpisodesPerPage;
  const pageEpisodes = filteredEpisodes.slice(pageStart, pageStart + podcastEpisodesPerPage);
  const featuredEpisodes = [...allEpisodes]
    .sort((first, second) => new Date(second.publishedAt) - new Date(first.publishedAt))
    .slice(0, featuredEpisodeLimit);
  featuredEpisodeCount = featuredEpisodes.length;
  featuredEpisodeIndex = Math.min(Math.max(0, featuredEpisodeIndex), Math.max(0, featuredEpisodeCount - 1));
  const featuredEpisode = featuredEpisodes[featuredEpisodeIndex];
  const featuredTrackIndex = featuredEpisode
    ? tracks.findIndex(track => track.title === featuredEpisode.title && track.artist === featuredEpisode.series.host)
    : 0;

  if (!featured || !featuredEpisode) {
    return `
      <div><p class="text-sm" style="color:var(--muted)">STUDIO VOICES</p><h1 class="text-2xl font-medium mt-1">팟캐스트</h1></div>
      <section class="surface rounded-2xl p-5"><p style="color:var(--muted)">팟캐스트 에피소드를 준비 중입니다.</p></section>
    `;
  }

  window.setTimeout(setupPodcastNotifications, 0);

  return `
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-3">
      <div><p class="text-sm" style="color:var(--muted)">STUDIO VOICES</p><h1 class="text-2xl font-medium mt-1">팟캐스트</h1></div>
      <span class="viz-badge">${allEpisodes.length} EPISODES</span>
    </div>

    <section class="podcast-hero surface rounded-3xl p-5 md:p-7 grid md:grid-cols-[1.15fr_.85fr] gap-6 items-center overflow-hidden">
      <div class="podcast-hero-copy min-w-0">
        <div class="podcast-hero-kicker">
          <div class="flex items-center gap-3">
            <span class="viz-badge">FEATURED EPISODE</span>
            <span>${featuredEpisode.epNumber}</span>
          </div>
          <div class="podcast-hero-controls">
            <span>${String(featuredEpisodeIndex + 1).padStart(2, "0")} / ${String(featuredEpisodeCount).padStart(2, "0")}</span>
            <button type="button" data-podcast-featured="previous" aria-label="이전 추천 에피소드">${icon("ChevronLeft")}</button>
            <button type="button" data-podcast-featured="next" aria-label="다음 추천 에피소드">${icon("ChevronRight")}</button>
          </div>
        </div>
        <h2 class="text-2xl md:text-4xl font-medium mt-4">${featuredEpisode.title}</h2>
        <p class="text-sm mt-3" style="color:var(--muted)">${featuredEpisode.summary}</p>
        <div class="podcast-hero-meta flex flex-wrap gap-2 mt-4 text-xs" style="color:var(--muted)">
          <span>${featuredEpisode.series.title}</span>
          <span>${featuredEpisode.series.host}</span>
          <span>${featuredEpisode.duration}</span>
        </div>
        <button type="button" class="podcast-hero-play purple-btn rounded-xl px-4 py-2 mt-5 inline-flex items-center gap-2" data-play-track="${featuredTrackIndex >= 0 ? featuredTrackIndex : 0}" data-podcast-cover="${featuredEpisode.series.coverImage}">${icon("Play")} 에피소드 재생</button>
      </div>
      <div class="podcast-cover-wrap">
        ${assetBox({ title: featuredEpisode.series.title, imageSrc: featuredEpisode.series.coverImage }, "podcast-cover rounded-3xl aspect-square w-full", "SM")}
      </div>
    </section>

    <div class="grid lg:grid-cols-[.95fr_1.05fr] gap-4">
      <section class="surface rounded-2xl p-4">
        <div class="flex justify-between items-center mb-4">
          <h2 class="font-medium">시리즈 카드</h2>
          <span class="text-sm" style="color:var(--muted)">${seriesList.length}개 채널</span>
        </div>
        <div class="grid md:grid-cols-3 lg:grid-cols-1 gap-3">
          ${seriesList.map(series => `
            <button type="button" class="podcast-series-card rounded-2xl p-3 text-left w-full ${series.id === selectedPodcastSeriesId ? "active" : ""}" data-podcast-series="${series.id}" aria-pressed="${series.id === selectedPodcastSeriesId ? "true" : "false"}">
              <div class="flex gap-3">
                ${assetBox({ title: series.title, imageSrc: series.coverImage }, "w-16 h-16 rounded-xl shrink-0", "SM")}
                <div class="min-w-0">
                  <p class="font-medium truncate">${series.title}</p>
                  <p class="text-xs mt-1" style="color:var(--muted)">${series.category}</p>
                  <p class="text-xs mt-2 line-clamp-2" style="color:var(--muted)">${series.description}</p>
                </div>
              </div>
            </button>
          `).join("")}
        </div>
      </section>

      <section class="surface rounded-2xl overflow-hidden">
        <div class="p-4 flex justify-between items-center">
          <h2 class="font-medium">에피소드 목록</h2>
          <span class="text-sm" style="color:var(--muted)">${pageStart + 1}-${Math.min(pageStart + podcastEpisodesPerPage, filteredEpisodes.length)} / ${filteredEpisodes.length}</span>
        </div>
        ${pageEpisodes.map(({ series, ...episode }, index) => {
          const episodeIndex = pageStart + index;
          const trackIndex = tracks.findIndex(track => track.title === episode.title && track.artist === series.host);
          return `
            <button type="button" class="podcast-episode-row track-row grid grid-cols-[52px_1fr_auto] gap-3 p-4 items-start text-left w-full ${episodeIndex === 0 ? "purple-soft" : ""}" data-track-index="${trackIndex >= 0 ? trackIndex : 0}" data-podcast-cover="${series.coverImage}">
              <div class="podcast-episode-number rounded-xl flex items-center justify-center">${episode.epNumber}</div>
              <div class="min-w-0">
                <p class="font-medium">${episode.title}</p>
                <p class="text-sm mt-1" style="color:var(--muted)">${series.title} · ${series.host} · ${episode.publishedAt}</p>
                <p class="text-sm mt-2 leading-6 podcast-description" style="color:var(--muted)">${episode.summary}</p>
              </div>
              <span class="text-sm whitespace-nowrap">${episode.duration}</span>
            </button>
          `;
        }).join("")}
        <nav class="podcast-pagination p-4 flex flex-wrap justify-center gap-2" aria-label="Podcast episodes pages">
          ${Array.from({ length: totalPages }, (_, index) => {
            const page = index + 1;
            return `<button type="button" class="podcast-page-button ${page === podcastEpisodePage ? "active" : ""}" data-podcast-page="${page}" aria-label="Episode page ${page}" aria-current="${page === podcastEpisodePage ? "page" : "false"}">${page}</button>`;
          }).join("")}
        </nav>
      </section>
    </div>
  `;
}

window.trackitPages = window.trackitPages || {};
window.trackitPages.podcasts = renderPodcasts;

function rerenderPodcasts() {
  const pageRoot = document.querySelector("[data-page-root]");
  if (!pageRoot) {
    return;
  }

  pageRoot.innerHTML = renderPodcasts();
  if (window.lucide) {
    lucide.createIcons();
  }
}

function setupPodcastNotifications() {
  const notificationButton = document.querySelector('button[aria-label="알림"]');
  if (!notificationButton || notificationButton.dataset.podcastNotificationsReady) {
    return;
  }

  notificationButton.dataset.podcastNotificationsReady = "true";
  notificationButton.dataset.podcastNotifications = "";
  notificationButton.setAttribute("aria-haspopup", "dialog");
  notificationButton.setAttribute("aria-expanded", "false");
  notificationButton.classList.add("podcast-notification-button");
  notificationButton.insertAdjacentHTML("beforeend", '<span class="podcast-notification-count" aria-label="새 알림 3개">3</span>');
}

function togglePodcastNotifications(button) {
  const existingPanel = document.querySelector("[data-podcast-notification-panel]");
  if (existingPanel) {
    existingPanel.remove();
    button.setAttribute("aria-expanded", "false");
    return;
  }

  const panel = document.createElement("aside");
  panel.className = "podcast-notification-panel";
  panel.dataset.podcastNotificationPanel = "";
  panel.setAttribute("role", "dialog");
  panel.setAttribute("aria-label", "팟캐스트 알림");
  panel.innerHTML = `
    <div class="podcast-notification-heading">
      <div><p>NOTIFICATIONS</p><h2>새 에피소드</h2></div>
      <button type="button" data-podcast-notification-close aria-label="알림 닫기">${icon("X")}</button>
    </div>
    <div class="podcast-notification-list">
      <button type="button" data-podcast-series="series-05"><span>주말의 영사실</span><strong>심야 영화관에서 홀로 들었던 테마</strong></button>
      <button type="button" data-podcast-series="series-04"><span>브런치 플레이리스트</span><strong>오후 2시, 느긋한 템포</strong></button>
      <button type="button" data-podcast-series="series-03"><span>밤 11시, 문장 수집가들</span><strong>마음의 밑줄을 긋는 단어들</strong></button>
    </div>
  `;
  document.body.appendChild(panel);
  button.setAttribute("aria-expanded", "true");
  if (window.lucide) {
    lucide.createIcons();
  }
}

function updatePodcastPlayerCover(coverImage) {
  const playerCover = document.getElementById("playerCover");
  if (!playerCover || !coverImage) {
    return;
  }

  const imageSource = new URL(coverImage, document.baseURI).href;
  const coverImageElement = new Image();
  playerCover.dataset.imageSrc = imageSource;

  coverImageElement.onload = () => {
    if (playerCover.dataset.imageSrc !== imageSource) {
      return;
    }
    playerCover.style.backgroundImage = `url("${imageSource}")`;
    playerCover.style.backgroundPosition = "center";
    playerCover.style.backgroundSize = "cover";
  };
  coverImageElement.src = imageSource;
}

document.addEventListener("click", event => {
  const seriesButton = event.target.closest("[data-podcast-series]");
  const pageButton = event.target.closest("[data-podcast-page]");
  const featuredButton = event.target.closest("[data-podcast-featured]");
  const podcastPlayButton = event.target.closest("[data-podcast-cover]");
  const notificationButton = event.target.closest("[data-podcast-notifications]");
  const notificationPanel = event.target.closest("[data-podcast-notification-panel]");
  const closeNotificationButton = event.target.closest("[data-podcast-notification-close]");

  if (notificationButton) {
    togglePodcastNotifications(notificationButton);
    return;
  }

  if (closeNotificationButton) {
    const panel = closeNotificationButton.closest("[data-podcast-notification-panel]");
    if (panel) {
      panel.remove();
    }
    const button = document.querySelector("[data-podcast-notifications]");
    if (button) {
      button.setAttribute("aria-expanded", "false");
    }
    return;
  }

  if (!notificationPanel) {
    const openPanel = document.querySelector("[data-podcast-notification-panel]");
    if (openPanel) {
      openPanel.remove();
      const button = document.querySelector("[data-podcast-notifications]");
      if (button) {
        button.setAttribute("aria-expanded", "false");
      }
    }
  }

  if (notificationPanel && seriesButton) {
    notificationPanel.remove();
  }

  if (podcastPlayButton) {
    window.setTimeout(() => {
      updatePodcastPlayerCover(podcastPlayButton.dataset.podcastCover);
    }, 0);
  }

  if (featuredButton) {
    const direction = featuredButton.dataset.podcastFeatured === "next" ? 1 : -1;
    featuredEpisodeIndex = (featuredEpisodeIndex + direction + featuredEpisodeCount) % featuredEpisodeCount;
    rerenderPodcasts();
    return;
  }

  if (seriesButton) {
    const seriesId = seriesButton.dataset.podcastSeries;
    selectedPodcastSeriesId = selectedPodcastSeriesId === seriesId ? "" : seriesId;
    podcastEpisodePage = 1;
    rerenderPodcasts();
    return;
  }

  if (!pageButton) {
    return;
  }

  podcastEpisodePage = Number(pageButton.dataset.podcastPage) || 1;
  rerenderPodcasts();
});

window.setInterval(() => {
  if (document.body.dataset.currentPage !== "podcasts" || !featuredEpisodeCount) {
    return;
  }

  featuredEpisodeIndex = (featuredEpisodeIndex + 1) % featuredEpisodeCount;
  rerenderPodcasts();
}, 6000);
