# Studio Midnight - Frontend Work Areas

백엔드 없이 화면과 인터랙션만 구현하는 프론트엔드 프로젝트입니다. 이제 화면은 개별 HTML 파일로 분리했고, 공통 스타일은 `css/studio-midnight.css`에서 관리합니다.

| 담당 | 파일 | 화면 범위 |
| --- | --- | --- |
| 1 | `index.html`, `js/trackit-app.js`, `css/studio-midnight.css` | 홈, 공통 레이아웃, 왼쪽 메뉴, 하단 재생 바 |
| 2 | `browse.html`, `album.html`, `js/trackit-pages.js` | 둘러보기, 앨범 상세 |
| 3 | `artists.html`, `artist-detail.html`, `js/trackit-pages.js` | 아티스트 목록, 아티스트 소개 상세 |
| 4 | `podcasts.html`, `playlist.html`, `search.html` | 팟캐스트, 플레이리스트, 검색 화면 |
| 5 | `mypage.html`, `settings.html`, `js/trackit-app.js` | 마이페이지, 로컬 회원가입 유효성 검사, 설정 |

## 파일 구조

- `index.html`: 홈
- `browse.html`: 둘러보기
- `album.html`: 앨범 상세
- `artists.html`: 아티스트 목록
- `artist-detail.html`: 아티스트 상세
- `podcasts.html`: 팟캐스트
- `playlist.html`: 플레이리스트
- `search.html`: 검색
- `mypage.html`: 마이페이지
- `settings.html`: 설정
- `css/studio-midnight.css`: 공용 스타일시트
- `js/trackit-data.js`: 메뉴, 앨범, 곡, 아티스트, 플레이리스트 데이터
- `js/trackit-pages.js`: 각 페이지 본문 렌더링
- `js/trackit-app.js`: 공통 메뉴, 검색 이동, 회원가입, 오디오 재생 바

## 공통 작업 규칙

- 공통 색상, 버튼, 카드, 반응형 규칙은 `css/studio-midnight.css`에서 수정합니다.
- 기존 호환 파일인 `trackit-frontend-mockup.html`, `music-library.html`, `store-orders.html`은 새 HTML 파일로 이동합니다.
- 아이콘은 Lucide의 `data-lucide` 속성을 사용합니다.
- 하단 재생 바는 모든 HTML 파일에 공통으로 들어가며 `z-index: 9999`를 사용합니다.
- 실제 음원 파일은 `assets/audio/`에 넣고, 임시 경로 목록은 `data/audio-tracks.json`과 `js/trackit-data.js`의 `audioSrc`에서 관리합니다.
- 회원가입은 로컬 데모입니다. 비밀번호는 저장하지 않고 유효성 검사에만 사용합니다.
