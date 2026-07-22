# Studio Midnight - Team Folder Map

각 팀원은 `pages/본인페이지/` 폴더를 중심으로 작업합니다. 공통 레이아웃, 색상, 버튼, 하단 재생 바 스타일은 `css/common.css`에서 관리합니다.

| 담당 | 폴더 | 주요 파일 |
| --- | --- | --- |
| 홈 | `pages/home/` | `index.html`, `page.css` |
| 둘러보기 | `pages/browse/` | `index.html`, `page.css` |
| 앨범 | `pages/album/` | `index.html`, `page.css` |
| 아티스트 | `pages/artists/`, `pages/artist-detail/` | `index.html`, `page.css` |
| 팟캐스트 | `pages/podcasts/` | `index.html`, `page.css` |
| 플레이리스트 | `pages/playlist/` | `index.html`, `page.css` |
| 검색 | `pages/search/` | `index.html`, `page.css` |
| 마이페이지 | `pages/mypage/` | `index.html`, `page.css` |
| 설정 | `pages/settings/` | `index.html`, `page.css` |

## 공용 파일

- `css/common.css`: 전체 공용 스타일, 폰트, 레이아웃, 카드, 버튼, 재생 바
- `js/trackit-data.js`: 메뉴, 앨범, 트랙, 아티스트 데이터
- `js/trackit-pages.js`: 각 화면 본문 렌더링
- `js/trackit-app.js`: 메뉴 이동, 검색 이동, 회원가입, 하단 재생 바
- `assets/audio/`: 음악 음원
- `assets/audio/podcasts/`: 팟캐스트 음원
- `assets/images/`: 앨범/아티스트/팟캐스트 이미지
- `assets/fonts/`: 공용 폰트 파일
- `data/`: 오디오, 이미지, 폰트, 팟캐스트 임시 JSON

## 팟캐스트 담당 참고

팟캐스트 작업은 `pages/podcasts/`, `data/podcast-episodes.json`, `assets/audio/podcasts/`, `assets/images/podcasts/`를 중심으로 진행하면 됩니다. 화면 스타일은 `pages/podcasts/page.css`에 추가하세요.

## 루트 HTML

루트의 `index.html`, `podcasts.html` 같은 파일은 호환용 리다이렉트입니다. 실제 작업은 `pages/*/index.html`에서 합니다.
