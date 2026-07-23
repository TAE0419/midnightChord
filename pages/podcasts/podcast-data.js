(function () {
  const podcastSeries = [
  {
    id: "series-01",
    title: "미드나잇 25시 정각",
    host: "마키아또",
    category: "일상 / 음악",
    description: "지친 하루 끝, 조용한 밤에 듣기 좋은 목소리로 일상과 음악 이야기를 차분하게 전합니다.",
    coverImage: "assets/images/podcasts/midnight-hello.jpg",
    isFeatured: true,
    episodes: [
      {
        id: "ep-101",
        epNumber: "EP.01",
        title: "안녕, 오늘도 빛난 당신에게",
        duration: "22:15",
        publishedAt: "2026-05-01",
        audioUrl: "assets/audio/podcasts/hello-ep01.mp3",
        summary: "퇴근길에 듣기 좋은 밤의 메시지. 작은 웃음과 함께 오늘의 마음을 가볍게 정리합니다."
      },
      {
        id: "ep-102",
        epNumber: "EP.02",
        title: "아무것도 하지 않아도 괜찮은 밤",
        duration: "18:40",
        publishedAt: "2026-06-03",
        audioUrl: "assets/audio/podcasts/hello-ep02.mp3",
        summary: "생각이 많아 잠들기 어려운 밤, 잠시 멈춰 서는 연습을 함께합니다."
      }
    ]
  },
  {
    id: "series-02",
    title: "아티스트의 새벽 작업실",
    host: "Studio Midnight",
    category: "음악 / 아티스트",
    description: "명곡과 신곡이 태어나는 밤의 현장. 아티스트의 비하인드와 사운드 메모를 소개합니다.",
    coverImage: "assets/images/podcasts/artist-studio.jpg",
    isFeatured: false,
    episodes: [
      {
        id: "ep-201",
        epNumber: "EP.01",
        title: "사랑받는 멜로디는 어떻게 만들어질까요?",
        duration: "31:10",
        publishedAt: "2026-05-07",
        audioUrl: "assets/audio/podcasts/artist-ep01.mp3",
        summary: "스튜디오에서 시작된 멜로디와 프로덕션 과정을 들여다봅니다."
      },
      {
        id: "ep-202",
        epNumber: "EP.02",
        title: "새벽 3시, 공간을 바꾸는 시간",
        duration: "25:50",
        publishedAt: "2026-06-12",
        audioUrl: "assets/audio/podcasts/artist-ep02.mp3",
        summary: "밤의 공기와 방의 울림이 곡 분위기를 어떻게 바꾸는지 이야기합니다."
      }
    ]
  },
  {
    id: "series-03",
    title: "밤 11시 문장 수집가들",
    host: "북클럽 미드나잇",
    category: "독서 / 에세이",
    description: "잠들기 전 마음에 오래 남는 문장을 함께 읽습니다. 밤을 채우는 소설과 에세이 추천.",
    coverImage: "assets/images/podcasts/book-collectors.jpg",
    isFeatured: false,
    episodes: [
      {
        id: "ep-301",
        epNumber: "EP.01",
        title: "지친 하루를 내려놓는 문장들",
        duration: "28:30",
        publishedAt: "2026-06-05",
        audioUrl: "assets/audio/podcasts/book-ep01.mp3",
        summary: "마음을 조금 느슨하게 만드는 밤의 에세이와 문장 세 가지를 소개합니다."
      },
      {
        id: "ep-302",
        epNumber: "EP.02",
        title: "길을 잃었을 때 읽는 모임의 소설",
        duration: "24:15",
        publishedAt: "2026-07-12",
        audioUrl: "assets/audio/podcasts/book-ep02.mp3",
        summary: "현실을 잠시 다른 시선으로 보게 만드는 매력적인 소설 이야기를 나눕니다."
      }
    ]
  },
  {
    id: "series-04",
    title: "브런치 플레이리스트",
    host: "모닝레터",
    category: "라이프 / 음악",
    description: "가벼운 식사와 커피 한 잔 사이에 듣기 좋은 음악 이야기. 주말 오전의 리듬, 동네의 소리, 일상을 환하게 여는 플레이리스트를 소개합니다.",
    coverImage: "assets/images/podcasts/brunch-playlist.jpg",
    isFeatured: false,
    episodes: [
      {
        id: "ep-401",
        epNumber: "EP.01",
        title: "햇살 좋은 창가에서 고른 첫 곡",
        duration: "21:40",
        publishedAt: "2026-04-06",
        audioUrl: "assets/audio/podcasts/walk-ep01.mp3",
        summary: "분주하지 않은 오전에 어울리는 곡들을 골라보고, 하루의 속도를 부드럽게 맞추는 작은 습관을 이야기합니다."
      },
      {
        id: "ep-402",
        epNumber: "EP.02",
        title: "동네 카페에서 들은 산뜻한 리듬",
        duration: "26:15",
        publishedAt: "2026-04-13",
        audioUrl: "assets/audio/podcasts/walk-ep02.mp3",
        summary: "커피 머신 소리와 낮은 대화 사이로 흐르는 음악을 따라가며, 편안한 주말 무드를 만드는 사운드를 나눕니다."
      }
    ]
  },
  {
    id: "series-05",
    title: "주말의 영사실",
    host: "시네마 미드나잇",
    category: "영화 / 문화",
    description: "주말 오후에 다시 꺼내 보고 싶은 영화와 그 장면을 오래 남게 만든 OST 이야기. 장면, 음악, 감정을 편안한 속도로 함께 감상합니다.",
    coverImage: "assets/images/podcasts/weekend-cinema.jpg",
    isFeatured: false,
    episodes: [
      {
        id: "ep-501",
        epNumber: "EP.01",
        title: "비 오는 오후에 다시 보는 영화 음악",
        duration: "30:05",
        publishedAt: "2026-07-10",
        audioUrl: "assets/audio/podcasts/cinema-ep01.mp3",
        summary: "익숙한 영화의 장면을 다른 온도로 들려주는 OST를 골라보고, 음악이 장면의 기억을 바꾸는 순간을 이야기합니다."
      },
      {
        id: "ep-502",
        epNumber: "EP.02",
        title: "엔딩 크레딧이 끝나도 남는 멜로디",
        duration: "27:50",
        publishedAt: "2026-07-16",
        audioUrl: "assets/audio/podcasts/cinema-ep02.mp3",
        summary: "영화가 끝난 뒤에도 머릿속에 남는 테마곡과 엔딩 음악을 중심으로, 여운을 만드는 사운드의 힘을 살펴봅니다."
      }
    ]
  }
];

  const tracks = podcastSeries.flatMap(series =>
    series.episodes.map(episode => ({
      title: episode.title,
      artist: series.host,
      time: episode.duration,
      audioSrc: episode.audioUrl,
      imageSrc: series.coverImage
    }))
  );

  window.trackitPodcastData = {
    podcastSeries,
    tracks
  };

  function applyPodcastData() {
    window.trackitData = window.trackitData || {};
    window.trackitData.podcastSeries = podcastSeries;
    window.trackitData.tracks = [
      ...(window.trackitData.tracks || []).filter(track => !track.audioSrc || !track.audioSrc.includes("assets/audio/podcasts/")),
      ...tracks
    ];
  }

  applyPodcastData();

  const originalFetch = window.fetch ? window.fetch.bind(window) : null;
  window.fetch = function (resource, options) {
    const url = typeof resource === "string" ? resource : resource && resource.url;
    if (url && url.includes("data/podcast-episodes.json")) {
      const body = JSON.stringify(podcastSeries);
      if (typeof Response === "function") {
        return Promise.resolve(new Response(body, {
          status: 200,
          headers: { "Content-Type": "application/json" }
        }));
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(podcastSeries)
      });
    }
    if (!originalFetch) {
      return Promise.reject(new TypeError("fetch is not available"));
    }
    return originalFetch(resource, options);
  };
})();

