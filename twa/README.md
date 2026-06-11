# TWA 빌드 치트시트

전체 설계는 [`../APP-HOSTING.md`](../APP-HOSTING.md) 참고. 여기는 명령어 순서만.

## 0. 선결 (인프라)
```bash
# Caddy가 .well-known 을 서빙하는지 (APP-HOSTING.md §3 패치 적용 후)
curl -I https://gear-forest.com/.well-known/assetlinks.json   # → 200 application/json
```

## 1. 환경
```bash
# JDK 17 + Android cmdline-tools 필요
brew install --cask temurin@17
npm i -g @bubblewrap/cli
bubblewrap doctor      # 환경 점검
```

## 2. 초기화 & 빌드
```bash
cd twa
# 기존 PWA manifest에서 시작 (twa-manifest.json 초안을 참고해 값 확정)
bubblewrap init --manifest https://gear-forest.com/manifest.webmanifest
#  → 프롬프트에서 packageId=com.gearforest.app, host=gear-forest.com 확인
#  → 업로드 keystore(android.keystore) 생성·비밀번호 보관(분실 주의)

bubblewrap build       # → app-release-bundle.aab + app-release-signed.apk
```

## 3. 업로드 키 지문 확인 (로컬 디버그 검증용)
```bash
keytool -list -v -keystore android.keystore -alias gearforest | grep SHA256
```

## 4. Play Console
1. 내부테스트 트랙에 `app-release-bundle.aab` 업로드
2. **앱 무결성 > 앱 서명**에서 **App Signing key SHA-256** 복사
3. `assetlinks.json.template` 의 `<<PLAY_APP_SIGNING_KEY_SHA256>>` 자리에 붙여넣기
4. 완성된 `assetlinks.json` 을 `site/.well-known/assetlinks.json` 으로 배포
5. 내부테스트 설치 → **주소창이 사라지면 검증 성공** ✅

## 흔한 실패
- 주소창 안 사라짐 → assetlinks에 업로드키 지문만 넣음(앱서명키 누락). §4 다시.
- 403/404 assetlinks → Caddy `hide .*` 차단. APP-HOSTING.md §3 패치.
- packageId 불일치 → assetlinks의 package_name 과 빌드 packageId 동일해야.
