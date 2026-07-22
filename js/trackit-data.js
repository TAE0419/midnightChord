window.trackitData = {
  pages: [
    { id: "home", label: "홈", icon: "Home", href: "pages/home/" },
    { id: "browse", label: "둘러보기", icon: "Search", href: "pages/browse/" },
    { id: "album", label: "앨범 상세", icon: "Disc3", href: "pages/album/" },
    { id: "artists", label: "아티스트", icon: "Mic2", href: "pages/artists/" },
    { id: "podcasts", label: "팟캐스트", icon: "Podcast", href: "pages/podcasts/" },
    { id: "playlist", label: "플레이리스트", icon: "ListMusic", href: "pages/playlist/" },
    { id: "mypage", label: "마이페이지", icon: "UserRound", href: "pages/mypage/" },
    { id: "settings", label: "설정", icon: "Settings", href: "pages/settings/" }
  ],
  albums: [
    { title: "Violet Night", artist: "LUNA", year: "2026", art: "album-art", imageSrc: "assets/images/covers/violet-night.jpg" },
    { title: "After Midnight", artist: "NOIR", year: "2026", art: "album-art-alt", imageSrc: "assets/images/covers/after-midnight.jpg" },
    { title: "Silent Frequency", artist: "WAVE", year: "2026", art: "album-art-dark", imageSrc: "assets/images/covers/silent-frequency.jpg" },
    { title: "Grey Motion", artist: "MOTION", year: "2026", art: "surface-soft", imageSrc: "assets/images/covers/grey-motion.jpg" },
    { title: "Rose Static", artist: "MUSE", year: "2026", art: "album-art-warm", imageSrc: "assets/images/covers/rose-static.jpg" },
    { title: "Blue Relay", artist: "KAI", year: "2026", art: "album-art-alt", imageSrc: "assets/images/covers/blue-relay.jpg" }
  ],
  tracks: [
    { title: "Violet Night", artist: "LUNA", time: "3:20", audioSrc: "assets/audio/violet-night.mp3" },
    { title: "Purple Orbit", artist: "MUSE", time: "3:48", audioSrc: "assets/audio/purple-orbit.mp3" },
    { title: "Night Drive", artist: "NOIR", time: "4:01", audioSrc: "assets/audio/night-drive.mp3" },
    { title: "Moon Signal", artist: "LUNA", time: "3:54", audioSrc: "assets/audio/moon-signal.mp3" },
    { title: "Rose Static", artist: "MUSE", time: "3:12", audioSrc: "assets/audio/rose-static.mp3" },
    { title: "Blue Relay", artist: "KAI", time: "2:58", audioSrc: "assets/audio/blue-relay.mp3" },
    { title: "안녕, 오늘도 빛난 당신에게", artist: "마키아또", time: "22:15", audioSrc: "assets/audio/podcasts/hello-ep01.mp3" },
    { title: "아무것도 하지 않아도 괜찮은 밤", artist: "마키아또", time: "18:40", audioSrc: "assets/audio/podcasts/hello-ep02.mp3" },
    { title: "사랑받은 멜로디는 어떻게 만들어졌나", artist: "Studio Midnight", time: "31:10", audioSrc: "assets/audio/podcasts/artist-ep01.mp3" },
    { title: "새벽 3시, 공간이 바뀌는 시간", artist: "Studio Midnight", time: "25:50", audioSrc: "assets/audio/podcasts/artist-ep02.mp3" },
    { title: "지친 하루를 내려놓는 문장들", artist: "북클럽 미드나잇", time: "28:30", audioSrc: "assets/audio/podcasts/book-ep01.mp3" },
    { title: "길을 잃었을 때 읽는 모임의 소설", artist: "북클럽 미드나잇", time: "24:15", audioSrc: "assets/audio/podcasts/book-ep02.mp3" }
  ],
  artists: [
    { name: "LUNA", plays: "128만 재생", initial: "L", imageSrc: "assets/images/artists/luna.jpg" },
    { name: "NOIR", plays: "94만 재생", initial: "N", imageSrc: "assets/images/artists/noir.jpg" },
    { name: "MUSE", plays: "81만 재생", initial: "M", imageSrc: "assets/images/artists/muse.jpg" },
    { name: "WAVE", plays: "77만 재생", initial: "W", imageSrc: "assets/images/artists/wave.jpg" }
  ],
  playlists: [
    { title: "Midnight Coding", meta: "18곡 · 비공개", art: "purple-soft", icon: "Moon" },
    { title: "Deep Focus", meta: "32곡 · 공개", art: "album-art-dark" },
    { title: "Purple Drive", meta: "24곡 · 공개", art: "album-art-alt" }
  ],
  podcastSeries: [
    {
      title: "미드나잇 25시 정각",
      host: "마키아또",
      category: "일상 / 음악",
      description: "지친 하루 끝에 조용히 켜놓기 좋은 밤의 오디오. 일상과 위로, 음악 이야기를 차분하게 전합니다.",
      coverImage: "assets/images/podcasts/midnight-hello.jpg",
      isFeatured: true,
      episodes: [
        {
          title: "안녕, 오늘도 빛난 당신에게",
          epNumber: "EP.01",
          duration: "22:15",
          publishedAt: "2026-04-01",
          summary: "퇴근길에 듣기 좋은 밤의 메시지. 작은 소음과 함께 오늘의 마음을 가볍게 정리합니다."
        },
        {
          title: "아무것도 하지 않아도 괜찮은 밤",
          epNumber: "EP.02",
          duration: "18:40",
          publishedAt: "2026-04-08",
          summary: "생각이 많아 잠들기 어려운 밤, 잠시 멈춰 서는 연습을 함께합니다."
        }
      ]
    },
    {
      title: "아티스트의 새벽 작업실",
      host: "Studio Midnight",
      category: "음악 / 아티스트",
      description: "명곡과 신곡이 태어나는 밤의 현장. 아티스트들의 비하인드와 사운드 메모를 소개합니다.",
      coverImage: "assets/images/podcasts/artist-studio.jpg",
      isFeatured: false,
      episodes: [
        {
          title: "사랑받은 멜로디는 어떻게 만들어졌나",
          epNumber: "EP.01",
          duration: "31:10",
          publishedAt: "2026-04-03",
          summary: "스튜디오에서 시작된 'Violet Night'의 멜로디와 프로덕션 과정을 들어봅니다."
        },
        {
          title: "새벽 3시, 공간이 바뀌는 시간",
          epNumber: "EP.02",
          duration: "25:50",
          publishedAt: "2026-04-10",
          summary: "밤의 공기와 방의 울림이 곡 분위기를 어떻게 바꾸는지 이야기합니다."
        }
      ]
    },
    {
      title: "밤 11시 문장 수집가들",
      host: "북클럽 미드나잇",
      category: "독서 / 에세이",
      description: "잠들기 전 마음에 오래 남는 문장을 함께 읽습니다. 밤을 채우는 소설과 에세이 추천.",
      coverImage: "assets/images/podcasts/book-collectors.jpg",
      isFeatured: false,
      episodes: [
        {
          title: "지친 하루를 내려놓는 문장들",
          epNumber: "EP.01",
          duration: "28:30",
          publishedAt: "2026-04-05",
          summary: "마음을 조금 느슨하게 만드는 밤의 에세이와 문장 세 가지를 소개합니다."
        },
        {
          title: "길을 잃었을 때 읽는 모임의 소설",
          epNumber: "EP.02",
          duration: "24:15",
          publishedAt: "2026-04-12",
          summary: "현실을 잠시 다른 시선으로 보게 만드는 매력적인 소설 이야기를 나눕니다."
        }
      ]
    }
  ]
};
