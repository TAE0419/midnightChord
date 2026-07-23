# Podcasts

Studio Midnight의 팟캐스트 화면을 담당하는 폴더입니다.

## 파일 구성

- `index.html`: `common.html`을 불러온 뒤 팟캐스트 화면을 공통 콘텐츠 슬롯에 연결합니다.
- `podcast-data.js`: 팟캐스트 시리즈와 에피소드 데이터를 준비하고 재생 가능한 트랙 목록에 연결합니다.
- `podcasts.js`: 시리즈 선택, 에피소드 목록, 페이지네이션을 렌더링합니다.
- `page.css`: 팟캐스트 전용 레이아웃과 스타일을 관리합니다.

## 데이터와 미디어

- 에피소드 데이터: `../../data/podcast-episodes.json`
- 음원: `../../assets/audio/podcasts/`
- 커버 이미지: `../../assets/images/podcasts/`

에피소드 행을 선택하면 공통 하단 재생바에 제목, 진행자, 음원 경로와 커버 이미지가 연결됩니다.

