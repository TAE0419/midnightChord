let podcastEpisodePage = 1;
const podcastEpisodesPerPage = 5;
let selectedPodcastSeriesId = "";

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
  const latestEpisode = allEpisodes[0];
  const latestTrackIndex = latestEpisode
    ? tracks.findIndex(track => track.title === latestEpisode.title && track.artist === latestEpisode.series.host)
    : 0;

  if (!featured || !latestEpisode) {
    return `
      <div><p class="text-sm" style="color:var(--muted)">STUDIO VOICES</p><h1 class="text-2xl font-medium mt-1">팟캐스트</h1></div>
      <section class="surface rounded-2xl p-5"><p style="color:var(--muted)">팟캐스트 에피소드를 준비 중입니다.</p></section>
    `;
  }

  return `
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-3">
      <div><p class="text-sm" style="color:var(--muted)">STUDIO VOICES</p><h1 class="text-2xl font-medium mt-1">팟캐스트</h1></div>
      <span class="viz-badge">${allEpisodes.length} EPISODES</span>
    </div>

    <section class="podcast-hero surface rounded-3xl p-5 md:p-7 grid md:grid-cols-[1.15fr_.85fr] gap-6 items-center overflow-hidden">
      <div class="min-w-0">
        <span class="viz-badge">NEW EPISODE</span>
        <h2 class="text-2xl md:text-4xl font-medium mt-4">${latestEpisode.title}</h2>
        <p class="text-sm mt-3" style="color:var(--muted)">${latestEpisode.summary}</p>
        <div class="flex flex-wrap gap-2 mt-4 text-xs" style="color:var(--muted)">
          <span>${latestEpisode.series.title}</span>
          <span>${latestEpisode.series.host}</span>
          <span>${latestEpisode.duration}</span>
        </div>
        <button type="button" class="purple-btn rounded-xl px-4 py-2 mt-5 inline-flex items-center gap-2" data-play-track="${latestTrackIndex >= 0 ? latestTrackIndex : 0}">${icon("Play")} 에피소드 재생</button>
      </div>
      <div class="podcast-cover-wrap">
        ${assetBox({ title: featured.title, imageSrc: featured.coverImage }, "podcast-cover rounded-3xl aspect-square w-full", "SM")}
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
            <button type="button" class="podcast-episode-row track-row grid grid-cols-[52px_1fr_auto] gap-3 p-4 items-start text-left w-full ${episodeIndex === 0 ? "purple-soft" : ""}" data-track-index="${trackIndex >= 0 ? trackIndex : 0}">
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

document.addEventListener("click", event => {
  const seriesButton = event.target.closest("[data-podcast-series]");
  const pageButton = event.target.closest("[data-podcast-page]");

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
