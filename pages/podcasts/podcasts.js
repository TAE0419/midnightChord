function renderPodcasts() {
  const { tracks = [], podcastSeries = [] } = window.trackitData || {};
  const seriesList = podcastSeries.length ? podcastSeries : [];
  const featured = seriesList.find(series => series.isFeatured) || seriesList[0];
  const allEpisodes = seriesList.flatMap(series => series.episodes.map(episode => ({ ...episode, series })));
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
            <article class="podcast-series-card rounded-2xl p-3">
              <div class="flex gap-3">
                ${assetBox({ title: series.title, imageSrc: series.coverImage }, "w-16 h-16 rounded-xl shrink-0", "SM")}
                <div class="min-w-0">
                  <p class="font-medium truncate">${series.title}</p>
                  <p class="text-xs mt-1" style="color:var(--muted)">${series.category}</p>
                  <p class="text-xs mt-2 line-clamp-2" style="color:var(--muted)">${series.description}</p>
                </div>
              </div>
            </article>
          `).join("")}
        </div>
      </section>

      <section class="surface rounded-2xl overflow-hidden">
        <div class="p-4 flex justify-between items-center">
          <h2 class="font-medium">에피소드 목록</h2>
          <span class="text-sm" style="color:var(--muted)">클릭해서 재생</span>
        </div>
        ${allEpisodes.map(({ series, ...episode }, index) => {
          const trackIndex = tracks.findIndex(track => track.title === episode.title && track.artist === series.host);
          return `
            <button type="button" class="podcast-episode-row track-row grid grid-cols-[52px_1fr_auto] gap-3 p-4 items-start text-left w-full ${index === 0 ? "purple-soft" : ""}" data-track-index="${trackIndex >= 0 ? trackIndex : 0}">
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
      </section>
    </div>
  `;
}

window.trackitPages = window.trackitPages || {};
window.trackitPages.podcasts = renderPodcasts;
