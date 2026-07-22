# Podcast Workspace

브랜치: `feature/podcasts`

## 팟캐스트 담당 폴더

- `pages/podcasts/index.html`: 팟캐스트 페이지 HTML 진입점
- `pages/podcasts/page.css`: 팟캐스트 전용 스타일
- `data/podcast-episodes.json`: 팟캐스트 에피소드 임시 데이터
- `assets/audio/podcasts/`: 팟캐스트 mp3 파일
- `assets/images/podcasts/`: 팟캐스트 커버 이미지

## 같이 확인할 공용 파일

- `js/trackit-pages.js`: `renderPodcasts()`에서 팟캐스트 화면 본문을 렌더링합니다.
- `js/trackit-app.js`: 하단 재생바와 클릭 이벤트를 관리합니다.
- `css/common.css`: 공용 색상, 버튼, 카드, 재생바, 폰트 설정을 관리합니다.

## 추천 작업 순서

1. `data/podcast-episodes.json`에 에피소드 정보를 정리합니다.
2. `assets/audio/podcasts/`와 `assets/images/podcasts/`에 실제 파일을 넣습니다.
3. `js/trackit-pages.js`의 `renderPodcasts()`를 에피소드 카드/목록/상세 설명 구조로 확장합니다.
4. `pages/podcasts/page.css`에 팟캐스트 전용 UI 스타일을 작성합니다.
5. 에피소드 클릭 시 기존 하단 재생바에 제목, 진행자, 음원 경로가 연결되게 만듭니다.
