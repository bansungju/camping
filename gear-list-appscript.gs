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

// 웹앱 URL(/exec) 접속 시 자동 실행
function doGet() {
  var n = fillGearList();
  return ContentService.createTextOutput('완료 — ' + n + '개 상품 입력됨. 시트를 확인하세요.');
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
