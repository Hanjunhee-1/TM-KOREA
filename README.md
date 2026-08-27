# 학원관리 프로그램 (TM-KOREA)

React + MUI 프론트엔드와 NestJS 백엔드로 구성된 학원관리 프로그램입니다.

## 구조

```
TM-KOREA/
├── src/                 # React + MUI 프론트엔드
├── backend/             # NestJS 백엔드
├── package.json
└── vite.config.ts
```

## 실행 방법

터미널 두 개를 사용하세요.

### 1. 백엔드 (NestJS)

```bash
cd backend
npm run start:dev
```

API 주소: http://localhost:3000  
헬스 체크: http://localhost:3000/api/health

### 2. 프론트엔드 (React + MUI)

프로젝트 루트에서:

```bash
npm run dev
```

앱 주소: http://localhost:5173

프론트의 `/api` 요청은 Vite 개발 서버가 `http://localhost:3000`으로 프록시합니다.

## 스크립트

| 위치 | 명령 | 설명 |
| --- | --- | --- |
| 루트 | `npm run dev` | 프론트 개발 서버 |
| 루트 | `npm run build` | 프론트 프로덕션 빌드 |
| backend | `npm run start:dev` | 백엔드 개발 서버 (watch) |
| backend | `npm run test` | 백엔드 단위 테스트 |
