# rhwp 호환성 및 Round-trip

이 문서는 추측이 아니라 **실제 확인한 API**와 **수동 Round-trip 결과**를 기록한다.

사용 패키지: `@rhwp/editor` **0.8.4** (`rhwp-adapter`를 통해서만 접근).
Studio URL 기본값: `https://edwardkim.github.io/rhwp/`

## API 한계 (0.8.4에서 확인)

| 기능 | 상태 |
| --- | --- |
| `createEditor` iframe 임베드 | 지원 |
| `loadFile` HWP | 지원 |
| `loadFile` HWPX | API/README 지원. 품질은 아래 Round-trip에 기록 |
| `exportHwp` | 지원. **변환만** 수행. 저장이 아님 |
| `exportHwpx` | API 존재. 품질은 강제하지 않음 |
| `notifySaved` | 호스트 영속화 **성공 후** Studio dirty/draft 해제 통지 |
| `pageCount` | 지원. Adapter `getPageCount()`로 캐시 노출 |
| `getPageSvg` | 지원. Adapter 래핑. 렌더 검증용 |
| `getRendererDiagnostics` | 지원(capability 협상 필요). Adapter가 좁은 형태로 매핑 |
| native `onChange` / `isDirty()` | **없음** |
| native `readOnly` | **없음** ([issue #226](https://github.com/edwardkim/rhwp/issues/226)) |

### 임베드 구현에서 확인한 동작 (node_modules/@rhwp/editor/index.js)

- `createEditor`는 iframe을 **즉시** 컨테이너에 `appendChild`하고, 그 뒤 `load` 이벤트와 `ready`를 기다린다.
- `_waitReady()`는 500ms 간격으로 최대 30회(약 15초) 폴링한다.
- 따라서 컨테이너를 재마운트하면(React StrictMode의 개발 모드 이중 마운트 포함) iframe이 두 개 쌓일 수 있고, 위에 있는 빈 iframe만 보이면서 문서는 아래(클리핑된) iframe에 로드된 것처럼 보인다.
- 대응: `DocumentEditor` 정리(cleanup)에서 `container.replaceChildren()`로 남은 iframe을 제거한다.
- `renderer` 옵션은 studio URL의 `?renderer=` 쿼리로 전달된다. 즉 `auto` / `canvas2d` / `canvaskit` 전환은 studio 측 선택이다.

native dirty event가 없어 현재는 iframe 상호작용으로 **변경 가능 상태(`possibly-modified`)를 추정**한다. 이를 실제 문서 변경 감지로 부르지 않는다.

## Export와 저장

```text
exportHwp()/exportHwpx()  →  Uint8Array (변환)
MockStorage.upload 또는 브라우저 다운로드  →  호스트 영속화 (서버 저장 아님)
성공 시에만 notifySaved()
```

MVP의 **저장**은 메모리 `MockStorage`이다. **다운로드**는 로컬 파일이다. 둘 다 MinIO/DB가 아니다.

향후:

```text
export → Backend → MinIO → DB version → notifySaved()
```

## Round-trip 절차 (필수)

대표 문서 1개로 아래를 수행한다. 학원 문제지 성격이면 다음을 포함하는 파일을 우선한다.

- 일반 텍스트, 한글/영문/숫자
- 수식
- 표
- 이미지
- 다양한 폰트
- 여러 페이지
- 페이지 레이아웃

파일은 `docs/rhwp/fixtures/`에 두고 Git에는 올리지 않는다.

### 필수 흐름

```text
원본 HWP
  → 웹 앱에서 파일 열기 (rhwp load)
  → 렌더 확인
  → 간단한 편집 (예: 한 글자 추가)
  → 다운로드 (exportHwp)
  → 한컴오피스에서 export 파일 열기
  → 문서 정상 여부 / 심각한 손상 여부 확인
```

### 가능하면 추가

```text
한컴오피스에서 export 파일을 다시 저장
  → 새 HWP
  → 웹 앱에서 다시 열기
  → 렌더 확인
```

한컴오피스 재열기는 이 환경에서 자동화할 수 없다. 로컬 PC에서 수행한 결과를 아래 표에 적는다.

## Round-trip 결과

대표 문서: rhwp 공개 샘플 `KTX.hwp` (OLE2 매직 `D0 CF 11 E0` 확인, 66,048 bytes). 로컬 경로 `docs/rhwp/fixtures/KTX.hwp` (Git 제외).

| File | Format | Open | Render | Edit | Export | Reopen in Hancom | Hancom resave → rhwp | Result | Issue |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| KTX.hwp (rhwp public sample) | HWP | ✓ | ✗ | 미확인 | ✓ | ✓ | 미확인 | PARTIAL | 문서는 로드되고 export/한컴 재열기는 정상(사용자 확인). 그러나 임베드된 studio 화면에 페이지가 그려지지 않음. 아래 "렌더 미표시" 참조 |

`Render` ✗의 근거: 사용자가 `KTX.hwp`를 열었을 때 studio의 메뉴/툴바는 표시되지만 문서 페이지 영역이 비어 있었다. 동시에 `exportHwp()` 결과는 원본과 동일하게 한컴오피스에서 정상적으로 열렸다. 즉 파싱/문서 상태는 정상이고 **화면 표시만** 실패한 상태다.

## 렌더 미표시 — 실측 진단과 조치

증상: 문서 load 성공 + export 정상 + 한컴 재열기 정상 / 임베드 화면에는 페이지 없음.
같은 파일을 https://edwardkim.github.io/rhwp/ 에서 직접 열면 정상 표시됨 → studio 자체가 아니라 **임베드 환경** 문제.

### 진단 결과 (렌더 진단 버튼)

```text
pages=1 · svgLength=756188 · backend=canvas2d · initialized=true
```

해석: 파싱·조판·renderer 초기화 모두 정상이고 `initError` / `renderError` / `blockers`가 없다.
문서는 완전히 준비된 상태이며 **canvas 페인트만 트리거되지 않았다.**

### studio 구현에서 확인한 원인 (assets/index-*.js, index-*.css)

- studio 루트와 body는 `height: 100vh` / `100dvh`를 쓴다. iframe 안에서는 iframe 박스 높이가 곧 뷰포트다.
- 페이지 페인트는 자체 viewport controller가 담당한다. `viewportWidth` / `viewportHeight`를 들고 있고,
  문서 컨테이너에 `ResizeObserver`와 `scroll` 리스너를 붙여 `viewport-resize` 이벤트를 발생시킬 때 다시 그린다.
- 즉 **resize/scroll 이벤트가 없으면 로드 후에도 페인트가 일어나지 않는다.** 임베드에서는 iframe 박스가
  로드 시점 전후로 변하지 않으므로 이 트리거가 빠질 수 있다. 독립 탭에서는 최초 레이아웃 과정에서 자연히 발생한다.

### 호스트 측 조치

1. 재마운트 시 남는 studio iframe 제거 (`container.replaceChildren()`).
   `createEditor`는 iframe을 즉시 붙이고 `ready`를 최대 15초 폴링하므로, 정리하지 않으면 빈 iframe이 위에 겹친다.
2. 에디터 영역에 **확정 높이** 부여 (`height: calc(100vh - 210px)`, `display: flex`).
   `min-height`만으로 이어진 체인에서는 iframe의 `height: 100%`가 auto로 풀릴 수 있다.
3. `RhwpEditorHandle.refreshLayout()` 추가. iframe 높이를 1px 줄였다가 다음 프레임에 되돌려
   studio의 `ResizeObserver`를 깨워 재측정·재페인트를 유도한다. Adapter 내부에만 존재한다.
4. `load()` 성공 직후 `refreshLayout()`를 호출하고, studio의 비동기 후처리를 고려해 250ms 후 한 번 더 호출한다.
5. **렌더 진단** 버튼도 마지막에 `refreshLayout()`를 호출하므로 수동 재페인트 수단으로 쓸 수 있다.

### 여전히 비어 있을 때

1. 임베드 안에서 studio 메뉴 **보기 → 배율 → 쪽 맞춤**(`Ctrl+G,P`)을 실행한다.
   이때 페이지가 나타나면 배율/스크롤 위치 문제이므로 위 재페인트 경로를 더 보강한다.
2. renderer를 바꿔 재현되는지 본다. 루트 `.env.local`:

   ```
   VITE_RHWP_RENDERER=auto
   ```

   `auto` / `canvas2d`(rhwp 기본) / `canvaskit`. 변경 후 dev 서버를 재시작한다.
3. 위 조치로도 해결되지 않으면 재현 정보를 정리해 [rhwp 이슈](https://github.com/edwardkim/rhwp/issues)로 보고한다.
   포함할 내용: `@rhwp/editor` 0.8.4 iframe 임베드, `pages`/`svgLength`/`backend` 진단값, iframe 크기, 브라우저 버전.

## 20개 호환성 매트릭스 (이번 단계 비강제)

| File | Format | Open | Render | Edit | Export | Reopen in Hancom | Result | Issue |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| sample-001 | HWP | | | | | | | |
| sample-002 | HWP | | | | | | | |

## 성능 메모

| File | Size | Pages | Load time | Notes |
| --- | --- | --- | --- | --- |
| | | | | |

## 보안 (현재)

- 확장자 `.hwp` / `.hwpx`만 허용
- MIME type은 신뢰하지 않음. OLE2 / ZIP 매직 바이트를 확인
- 크기 제한 50MB
- 손상/비정상 파일은 Adapter에서 `PARSE_FAILED` 등으로 매핑하고 UI에는 짧은 한국어만 표시
