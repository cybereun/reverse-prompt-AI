# Reverse Prompt AI — Hero Landing Page

이 폴더는 `역프롬프트 이미지 생성 AI`의 소개용 히어로 랜딩 페이지 리소스를
기존 애플리케이션과 분리하여 관리하는 독립 작업 영역입니다.

## 분리 원칙

- 기존 애플리케이션 소스와 API 로직은 수정하지 않습니다.
- 히어로 페이지의 스타일, 스크립트와 이미지는 이 폴더 안에서 관리합니다.
- 배포 진입 파일은 저장소 최상위 `index.html`이며 기존 앱 진입 파일은 `app/index.html`입니다.
- 히어로 페이지의 `앱 시작하기` 버튼은 기존 앱 주소로 연결합니다.
- 개발과 검증은 `codex/hero-landing-page` 브랜치에서 진행합니다.
- 완성 후 검토를 거쳐야만 `main` 브랜치에 병합합니다.

## 구성

```text
index.html          # `/` 히어로 진입 파일
app/
└─ index.html       # `/app` 기존 애플리케이션 진입 파일
hero/
├─ assets/          # 랜딩 페이지 이미지와 정적 리소스
├─ styles.css
├─ script.js
└─ README.md
```

## 배포 경로

- `/` — 히어로 랜딩 페이지
- `/app` — 기존 이미지 분석·생성 애플리케이션

## 로컬 미리보기

저장소 루트에서 개발 서버를 실행한 뒤 `/`와 `/app` 경로를 각각 확인합니다.
배포 전에는 `npm run build` 결과에 `dist/index.html`과 `dist/app/index.html`이
모두 생성되는지 확인합니다.
