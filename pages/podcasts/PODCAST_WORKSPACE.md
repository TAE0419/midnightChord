# Podcast Workspace

## 담당 파일

- `index.html`: 공통 레이아웃을 로드하고 팟캐스트 화면을 시작합니다.
- `podcast-data.js`: 시리즈, 에피소드, 음원 경로를 관리합니다.
- `podcasts.js`: 팟캐스트 화면 렌더링과 시리즈/페이지 이동을 처리합니다.
- `page.css`: 팟캐스트 전용 UI를 관리합니다.

## 공통 레이아웃 연결

`index.html`은 루트의 `common.html`을 불러와 사이드바, 상단 검색창, 하단 재생바를 구성합니다. 이후 `[data-common-page-slot]`에 팟캐스트 콘텐츠를 추가하고 `trackit-app.js`를 실행합니다.

## 작업 확인

1. `podcast-data.js`의 에피소드 제목, 진행자, `audioUrl`, `coverImage`를 확인합니다.
2. `../../assets/audio/podcasts/`에 연결한 음원이 있는지 확인합니다.
3. 시리즈를 선택하거나 에피소드 페이지를 이동했을 때 목록이 갱신되는지 확인합니다.
4. 에피소드 행을 선택했을 때 하단 재생바의 제목, 진행자, 커버가 바뀌는지 확인합니다.
