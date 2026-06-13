/**
 * 장비의 숲(gear-forest.com) 공개 데이터를 가져와
 * 현재 스프레드시트에 [카테고리, 제품명, 가격, 쿠팡링크] 순으로 채운다.
 *
 * 사용법:
 *  1) 대상 시트를 연 상태에서 확장 프로그램 > Apps Script
 *  2) 이 코드 전체를 붙여넣고 저장
 *  3) fillGearList 실행 (최초 1회 권한 승인 필요)
 *
 * 쿠팡링크(D열)는 비워두므로 직접 입력하면 된다.
 */

var SITE = 'https://gear-forest.com';
var SHEET_ID = '1yjRXPO2ZOW6QEEU74WDAaHU3w1h1e9p6lJyKc7Nkcpc';
var SHEET_NAME = '시트1'; // 다른 시트에 쓰려면 이름 변경

// 웹앱 URL(/exec) 접속 시 자동 실행 — H열 완료 체크(비파괴).
// 주의: 시트를 사이트 데이터로 다시 채우려면(파괴적) 에디터에서 fillGearList를 직접 실행할 것.
function doGet() {
  var n = markApplied();
  return ContentService.createTextOutput('완료 — H열 ' + n + '건 ✅ 표기됨. 시트를 확인하세요.');
}

function fillGearList() {
  // 1) 카테고리 목록
  var manifest = JSON.parse(
    UrlFetchApp.fetch(SITE + '/data/manifest.json', { muteHttpExceptions: true }).getContentText()
  );
  var categories = manifest.categories || [];

  // 2) 각 카테고리 JSON에서 상품 추출
  var rows = [];
  for (var i = 0; i < categories.length; i++) {
    var cat = categories[i];
    var catName = cat.name || cat.slug;
    var url = SITE + '/data/' + cat.slug + '.json';
    var resp = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
    if (resp.getResponseCode() !== 200) continue;

    var data = JSON.parse(resp.getContentText());
    var models = data.models || [];
    for (var j = 0; j < models.length; j++) {
      var m = models[j];
      var name = ((m.brand || '') + ' ' + (m.model || '')).trim();
      var price = (m.price_min != null) ? m.price_min : (m.price_max != null ? m.price_max : '');
      var coupang = m.coupang_url || ''; // 비어 있으면 D열 공란
      rows.push([catName, name, price, coupang]);
    }
  }

  // 3) 시트에 출력
  var ss = SpreadsheetApp.openById(SHEET_ID);
  var sheet = ss.getSheetByName(SHEET_NAME) || ss.getSheets()[0];
  sheet.clearContents();
  sheet.getRange(1, 1, 1, 4).setValues([['카테고리', '제품명', '가격', '쿠팡링크']]);
  if (rows.length) {
    sheet.getRange(2, 1, rows.length, 4).setValues(rows);
  }

  Logger.log('완료: ' + rows.length + '개 상품 입력됨');
  return rows.length;
}

/**
 * 특정 카테고리 상품을 시트 '맨 아래에 추가'(비파괴 — 기존 행·쿠팡링크 보존).
 * 중복 방지: 이미 B열(제품명)에 있는 제품은 건너뛴다. 여러 번 실행해도 안전.
 *
 * 사용: appendBackpackingBags 실행. (다른 카테고리는 appendCategory('slug') 직접 호출)
 */
function appendCategory(slug) {
  var resp = UrlFetchApp.fetch(SITE + '/data/' + slug + '.json', { muteHttpExceptions: true });
  if (resp.getResponseCode() !== 200) { Logger.log('데이터 없음: ' + slug); return 0; }
  var data = JSON.parse(resp.getContentText());
  var catName = data.name || slug;
  var models = data.models || [];

  var ss = SpreadsheetApp.openById(SHEET_ID);
  var sheet = ss.getSheetByName(SHEET_NAME) || ss.getSheets()[0];
  var last = sheet.getLastRow();

  // 기존 제품명(B열) 집합 — 중복 추가 방지
  var seen = {};
  if (last >= 2) {
    var names = sheet.getRange(2, 2, last - 1, 1).getValues();
    for (var k = 0; k < names.length; k++) seen[(names[k][0] || '').toString()] = true;
  }

  var rows = [];
  for (var j = 0; j < models.length; j++) {
    var m = models[j];
    var name = ((m.brand || '') + ' ' + (m.model || '')).trim();
    if (seen[name]) continue; // 이미 있음 → 스킵
    var price = (m.price_min != null) ? m.price_min : (m.price_max != null ? m.price_max : '');
    rows.push([catName, name, price, m.coupang_url || '']);
  }

  // 헤더가 없으면(빈 시트) 먼저 추가
  if (last < 1) {
    sheet.getRange(1, 1, 1, 4).setValues([['카테고리', '제품명', '가격', '쿠팡링크']]);
    last = 1;
  }
  if (rows.length) sheet.getRange(last + 1, 1, rows.length, 4).setValues(rows);
  Logger.log(catName + ' 추가: ' + rows.length + '개 (중복 ' + (models.length - rows.length) + '개 스킵)');
  return rows.length;
}

function appendBackpackingBags() {
  return appendCategory('backpacking-bag');
}

/**
 * H열(적용 완료 여부) 자동 체크.
 * D열에 유효한 쿠팡 단축링크(https://link.coupang.com...)가 있는 행 = 상용반영 완료 → H열에 ✅.
 * 사용: 이 함수를 추가 저장 후 markApplied 실행(최초 1회 권한 승인).
 */
function markApplied() {
  var ss = SpreadsheetApp.openById(SHEET_ID);
  var sheet = ss.getSheetByName(SHEET_NAME) || ss.getSheets()[0];
  var last = sheet.getLastRow();
  if (last < 2) return 0;
  var links = sheet.getRange(2, 4, last - 1, 1).getValues(); // D열(쿠팡링크)
  var existing = sheet.getRange(2, 8, last - 1, 1).getValues(); // H열 기존값
  var done = 0;
  var out = links.map(function (row, i) {
    var v = (row[0] || '').toString();
    var ok = v.indexOf('https://link.coupang.com') === 0;
    if (ok) done++;
    var cur = (existing[i][0] || '').toString();
    return [ok ? '✅' : (cur || '')]; // 쿠팡링크 없는 행은 기존값 유지(덮어쓰기 방지)
  });
  sheet.getRange(2, 8, out.length, 1).setValues(out); // H열(=8번째 열)
  Logger.log('H열 완료 표기: ' + done + '건');
  return done;
}
