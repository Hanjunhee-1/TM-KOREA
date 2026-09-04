# 학원관리 프로그램 (TM-KOREA)

React + MUI 프론트엔드와 NestJS 백엔드로 구성된 학원관리 프로그램입니다.

현재 단계는 **rhwp 기반 HWP/HWPX 문서 편집 모듈**만 구현합니다.

## 구조

```
TM-KOREA/
├── src/                      # React + MUI 프론트엔드
│   ├── pages/                # HomePage(진입점) / DocumentEditorPage(편집기 전용)
│   ├── routes.ts             # 해시 라우팅 (#/editor)
│   ├── features/document-editor/
│   └── lib/document-storage/ # MockStorage (MinIO 아님)
├── packages/rhwp-adapter/    # @rhwp/editor 격리 계층
├── docs/rhwp/                # 호환성 / Round-trip 기록
├── backend/                  # NestJS (health check만)
├── package.json
└── vite.config.ts
```

앱 코드는 `@rhwp/editor`를 직접 import하지 않습니다. `rhwp-adapter`만 사용합니다.

## 실행 방법

터미널 두 개를 사용하세요.

### 1. 백엔드 (NestJS)

```bash
cd backend
npm run dev
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

문서 편집기는 기본값으로 `https://edwardkim.github.io/rhwp/`의 rhwp-studio를 iframe으로 임베드합니다. 네트워크가 필요합니다.

## 페이지 구성

메인 페이지에는 편집기가 없습니다. 중앙의 **rhwp 편집기 열기** 버튼을 누르면 편집기 전용 페이지가 새 탭에서 열립니다.

| 경로 | 페이지 | 내용 |
| --- | --- | --- |
| `/` | `HomePage` | 편집기 진입 버튼, API 헬스 체크 |
| `/#/editor` | `DocumentEditorPage` | 페이지 전체가 rhwp 편집기. 호스트 UI 없음 |

`#/editor`는 직접 입력해도 열립니다. 서버 rewrite 설정이 필요 없도록 해시 라우팅을 쓰며, 페이지가 늘어나면 라우터로 교체하면 됩니다. 편집기 페이지는 탭마다 독립적이므로 열려 있는 문서와 상태는 탭 간에 공유되지 않습니다.

## 문서 편집 흐름

편집기 페이지는 호스트 크롬 없이 studio가 탭 전체를 차지합니다. 따라서 **파일 열기와 저장은 studio 자체 파일 메뉴로 수행합니다.**

- **열기**: studio 파일 → 열기. 크로스 오리진 iframe에서는 File System Access가 막히므로 studio 내부 file input으로 폴백합니다.
- **저장 / 다른 이름으로 저장**: studio 파일 메뉴. 같은 이유로 브라우저 다운로드로 폴백합니다. 근거는 [docs/rhwp/compatibility.md](docs/rhwp/compatibility.md)의 "저장 경로" 절.

호스트 저장 계층(파일 검증, MockStorage, `notifySaved()`)은 코드와 테스트에 그대로 남아 있지만 현재 UI에 연결되어 있지 않습니다. 실제 서버 저장을 붙이는 단계에서 다시 노출해야 합니다. 그 계층의 원래 흐름은 다음과 같습니다.

```text
HWP → load → rhwp Studio → Edit → possibly-modified
  → export → Uint8Array → MockStorage 또는 다운로드
  → 성공 시에만 notifySaved() → saved
```

- **저장**: 브라우저 메모리 MockStorage. 서버/MinIO 저장이 아닙니다.
- **다운로드**: `exportHwp`/`exportHwpx` 후 로컬 파일. MVP에서는 다운로드 성공 후 `notifySaved()`를 호출하지만, 이것도 서버 저장이 아닙니다.
- **편집 중 (변경 가능)**: native dirty API가 없어 사용자-에디터 상호작용으로 추정합니다.

Round-trip 절차와 결과는 [docs/rhwp/compatibility.md](docs/rhwp/compatibility.md)를 참고하세요.

### 렌더 진단

Adapter는 `getRendererDiagnostics()`와 `getPageSvg()`를 노출하며, `useDocumentEditorState().runDiagnostics()`가 페이지 수, SVG 길이, renderer backend, 초기화/렌더 오류를 모아 콘솔에 출력합니다. 호스트 UI를 제거했으므로 현재 화면에 진단 버튼은 없습니다. 필요하면 호스트 툴바를 다시 노출할 때 함께 살리면 됩니다.

studio는 자체 `ResizeObserver` / scroll 이벤트로만 페이지를 다시 그리기 때문에, 문서 로드 직후 Adapter가 iframe 박스를 1px 흔들어 재페인트를 트리거합니다(`refreshLayout()`). 자세한 근거는 [docs/rhwp/compatibility.md](docs/rhwp/compatibility.md)의 "렌더 미표시" 절에 있습니다.

renderer는 환경 변수로 바꿀 수 있습니다. 루트에 `.env.local`을 만들고:

```
VITE_RHWP_RENDERER=auto
```

`auto` / `canvas2d`(rhwp 기본) / `canvaskit` 중 하나를 지정한 뒤 dev 서버를 다시 시작하세요. 이 값은 studio URL의 `?renderer=` 쿼리로 전달됩니다.

## 스크립트

| 위치 | 명령 | 설명 |
| --- | --- | --- |
| 루트 | `npm run dev` | 프론트 개발 서버 |
| 루트 | `npm run build` | 프론트 프로덕션 빌드 |
| 루트 | `npm run test` | Adapter / 파일 검증 / MockStorage 단위 테스트 |
| backend | `npm run start:dev` | 백엔드 개발 서버 (watch) |
| backend | `npm run test` | 백엔드 단위 테스트 |
