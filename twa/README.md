# TWA 빌드 치트시트

전체 설계는 [`../APP-HOSTING.md`](../APP-HOSTING.md) 참고. 여기는 명령어 순서만.

## ✅ 이미 준비된 것 (2026-06-11 자동 생성)
- **업로드 keystore**: `twa/android.keystore` (alias `gearforest`, RSA2048, gitignore됨). 비번: `twa/keystore.properties`(gitignore됨) — **오프라인 백업 필수**.
- **업로드키 SHA-256**: `D7:52:E1:9E:40:0D:2C:A2:1F:C9:8D:76:EB:32:FB:F2:A5:6F:15:61:85:03:0D:4D:B7:2B:12:73:0D:06:9D:ED` (twa-manifest `fingerprints`에 등록됨)
- **assetlinks 선조립**: `twa/assetlinks.staged.json` (업로드키 1개. Play 업로드 후 App Signing SHA 추가→`site/.well-known/assetlinks.json`로 복사·커밋)
- **`site/.nojekyll`**: Pages가 `.well-known` 서빙하도록.
- 툴: Node22, bubblewrap CLI(`~/.npm-global/bin`), JDK17(`/opt/homebrew/opt/openjdk@17`).

## ⏸️ AAB 빌드 (보류 — Play 계정 생성 후 1회 실행)
> 미리 빌드 안 하는 이유: Android SDK 대용량 다운로드 + targetSdk/versionCode stale화. Play 계정 준비되면 실행.
```bash
export PATH="$HOME/.npm-global/bin:$PATH"
export JAVA_HOME=/opt/homebrew/opt/openjdk@17
cd twa
bubblewrap init --manifest https://gear-forest.com/manifest.webmanifest
#  프롬프트: packageId=com.gearforest.app, host=gear-forest.com, 기존 android.keystore 사용
bubblewrap build   # → app-release-bundle.aab (targetSdk 35 확인: §1-b)
```

## 0. 선결 (인프라)
```bash
# Caddy가 .well-known 을 서빙하는지 (APP-HOSTING.md §3 패치 적용 후)
curl -I https://gear-forest.com/.well-known/assetlinks.json   # → 200 application/json
```

## 1. 환경
```bash
# JDK 17 — 필수. Bubblewrap은 Android SDK만 자동 다운로드하고 JDK는 자동설치 안 함.
brew install --cask temurin@17
npm i -g @bubblewrap/cli
bubblewrap doctor      # 환경 점검 (JDK 경로 인식 확인)
```

## 1-b. 🚨 targetSdk 게이트 (출시 차단 항목)
Play는 신규앱 **targetSdkVersion 35**(2025.8~) 요구. Bubblewrap npm 기본값이 33일 수 있음(Issue #860).
→ `bubblewrap build` 후 **반드시** 확인하고, 35 미만이면 패치:
```bash
grep targetSdkVersion app/build.gradle    # 35 미만이면 ↓
# app/build.gradle 의 targetSdkVersion 을 35로 직접 수정 후 재빌드
```
targetSdk 35는 edge-to-edge 기본 활성 → 상태바/노치 레이아웃(viewport-fit) 점검.

## 2. 초기화 & 빌드
```bash
cd twa
# 기존 PWA manifest에서 시작 (twa-manifest.json 초안을 참고해 값 확정)
bubblewrap init --manifest https://gear-forest.com/manifest.webmanifest
#  → 프롬프트에서 packageId=com.gearforest.app, host=gear-forest.com 확인
#  → 업로드 keystore(android.keystore) 생성·비밀번호 보관(분실 주의)

bubblewrap build       # → app-release-bundle.aab + app-release-signed.apk
```

## 3. 키 2종 — 어느 SHA-256이 assetlinks에 필요한가 (혼동 주의)
| 테스트 방식 | 설치 앱의 서명 | assetlinks에 필요한 지문 |
|---|---|---|
| 로컬 `bubblewrap build` APK를 ADB 직접설치 | **업로드 키**(android.keystore) | 업로드 키 SHA-256 |
| Play Store(내부테스트 포함) 내려받기 | **App Signing 키**(Google 보관) | App Signing 키 SHA-256 |
→ 둘 다 테스트하려면 **두 지문 모두** 넣는다. 업로드 키 지문:
```bash
keytool -list -v -keystore android.keystore -alias gearforest | grep SHA256   # 대문자 출력
```

## 4. Play Console + assetlinks 등록 (순서 중요)
1. 내부테스트 트랙에 `app-release-bundle.aab` 업로드
2. **앱 무결성 > 앱 서명**에서 **App Signing key SHA-256** 복사 (소문자면 대문자 변환)
3. **🚨 빈 파일 함정**: `generateAssetLinks`는 `twa-manifest.json`의 `fingerprints` 배열만 출력 — 비면 빈 파일 생성(조용히 실패). 먼저 등록:
   ```bash
   bubblewrap fingerprint add <APP_SIGNING_SHA256> --name "Play App Signing"
   bubblewrap fingerprint add <UPLOAD_SHA256>      --name "Upload key (local)"   # 로컬 테스트용
   bubblewrap fingerprint generateAssetLinks       # → assetlinks.json 출력
   ```
   (수동 작성 시: `assetlinks.json.template`의 `<<...>>` 두 자리 채움)
4. 완성된 `assetlinks.json` 을 `site/.well-known/assetlinks.json` 으로 커밋 → `git push` → **GitHub Actions가 gear-forest.com에 자동 배포**. (origin=GitHub Pages 실측 확정. Caddy/mini/launchctl 불필요. `site/.nojekyll`로 점디렉터리 서빙 보장)
5. **검증**: `https://digitalassetlinks.googleapis.com/v1/statements:list?source.web.site=https://gear-forest.com&relation=delegate_permission/common.handle_all_urls` 가 내 지문을 반환하는지 확인
6. 내부테스트 설치 → **주소창이 사라지면 성공** ✅ (안 되면 캐시 5분~1h, `adb shell pm clear com.google.android.gms` 또는 재부팅 후 재시도)

## 흔한 실패
- assetlinks 빈 배열 → `fingerprint add` 안 하고 `generateAssetLinks` 실행(Issue #486). §4-3.
- 주소창 안 사라짐 → assetlinks에 업로드키만 넣고 Play 앱 테스트(App Signing키 누락). §3 표.
- 검증 캐시 → 배포 직후 5분~1h 캐시. 위 6번 캐시 클리어.
- 403/404 assetlinks → Caddy `hide .*` 차단. APP-HOSTING.md §3 패치 + `launchctl kickstart`(admin off라 `caddy reload` 불가).
- SHA 형식 → 소문자/콜론없음/공백 → 실패. 대문자 hex 콜론구분.
- packageId 불일치 → assetlinks `package_name` = 빌드 `applicationId`(com.gearforest.app) 정확 일치.

## 딥링크 테스트 (선택)
```bash
adb shell am start -a android.intent.action.VIEW -d "https://gear-forest.com" com.gearforest.app
```
