// 쿠팡 파트너스 자동링크 인브라우저 러너 v4
// 사용: partners.coupang.com(로그인) 탭에서 이 파일 내용을 execute_javascript로 주입(함수 정의) 후
//       startCoupangRunner(queue, cfg) 호출.
//   queue: [{sheetRow:Number, name:String}, ...]   (시트 B열 제품명)
//   cfg:   {brand_aliases:{...}, query_overrides:{...}}  ← coupang_search_aliases.json 그대로 전달
// 진행/결과: window.__runner = {results, status, i, total, log}.  중단: window.__runner.abort=true (다음 호출 직전 체크)
// 안전장치: 검색↔딥링크/상품 사이 랜덤 8~25초, 5건마다 1~3분 휴식, rCode!=0 / HTTP 429 즉시 중단.
//
// v4 개선(2026-06-14):
//   1) 숫자 모델번호(>=50, 예 300·510)는 검색에선 떨구되 "검증 핵심토큰"으론 유지 → 누락 시 reject.
//      (용량 \dP/\d인용·연도 20\d\d·작은수<50 만 진짜 노이즈로 제외)
//   2) 변형토큰(EX/V2/V3/2.0/3.0/Pro/Plus/Max) 집합이 쿼리와 후보 title에서 정확히 일치해야 함
//      → "허브돔 2P"가 "허브돔 2P EX"를 집는 오류 차단.
//   3) 'ok' 오통과 차단: 핵심토큰 60% 이상 + 모델번호 전부 일치 필수, 일부 누락 시 low_conf.
window.startCoupangRunner = function(queue, cfg){
  cfg = cfg || {};
  var aliases   = cfg.brand_aliases   || {};
  var overrides = cfg.query_overrides || {};
  var EXCL    = ["폴대","그라운드시트","전용","보관함","파우치","케이스","리페어","이너텐트","깔개","플라이시트","풋프린트","수납가방"];
  var VARIANT = ["EX","V2","V3","V4","2.0","3.0","PRO","PLUS","MAX"];

  window.__abort = false;
  window.__runner = {results:[], status:"running", i:0, total:queue.length, log:[], v:4};
  var R = window.__runner;

  function sleep(ms){return new Promise(function(r){setTimeout(r,ms);});}
  function rnd(a,b){return Math.floor(a+Math.random()*(b-a));}
  function afatk(){var m=document.cookie.match(/(?:^|;\s*)AFATK=([^;]+)/);return m?decodeURIComponent(m[1]):"";}
  function post(url,body){return new Promise(function(res,rej){
    var x=new XMLHttpRequest();x.open("POST",url,true);
    x.setRequestHeader("accept","application/json, text/plain, */*");
    x.setRequestHeader("content-type","application/json");
    x.setRequestHeader("lang","ko-KR");
    var t=afatk();if(t)x.setRequestHeader("x-token",t);
    x.onload=function(){var j=null;try{j=JSON.parse(x.responseText);}catch(e){}res({status:x.status,json:j});};
    x.onerror=function(){rej(new Error("neterr"));};
    x.send(JSON.stringify(body));
  });}

  // 검색어 broaden용: 후행에서 떨굴 수 있는 토큰(모델코드/용량/연도/버전/순수숫자)
  function isDropSearch(t){return /^[A-Za-z]+-?\d+[A-Za-z]*$/.test(t)||/^\d+P$/i.test(t)||/^\d+인용$/.test(t)||/^20\d\d$/.test(t)||/^V\d+$/i.test(t)||/^\d+$/.test(t);}
  // 검증 핵심토큰에서 뺄 "진짜 노이즈": 용량·연도·작은 순수숫자(<50). 모델번호(>=50)·단어·변형은 유지.
  function isNoise(t){return /^\d+P$/i.test(t)||/^\d+인용$/.test(t)||/^20\d\d$/.test(t)||(/^\d+$/.test(t)&&parseInt(t,10)<50);}
  function capOf(s){var m=(s||"").match(/(\d+)\s*(P|인용)/i);return m?m[1]:null;}
  function variantsOf(s){var up=(s||"").toUpperCase();return VARIANT.filter(function(v){return up.indexOf(v)>-1;});}
  function aliasQ(name){
    if(overrides[name]) return {q:overrides[name], ov:true};
    for(var k in aliases){ if(name.indexOf(k)===0){ var rest=name.slice(k.length).trim(); return {q:(aliases[k]+(rest?" "+rest:"")).trim(), ov:false}; } }
    return {q:name, ov:false};
  }
  function ladder(q,ov){
    var toks=q.split(/\s+/).filter(Boolean);
    if(ov) return [q];
    var c=[toks.join(" ")], t=toks.slice();
    while(t.length>2){ if(isDropSearch(t[t.length-1])){ t=t.slice(0,-1); c.push(t.join(" ")); } else break; }
    return c;
  }
  function median(arr){var a=arr.slice().sort(function(x,y){return x-y;});return a[Math.floor(a.length/2)];}

  (async function(){
    for(var k=0;k<queue.length;k++){
      if(R.abort){R.status="aborted";break;}
      var it=queue[k]; R.i=k+1;
      try{
        var aq=aliasQ(it.name), cands=ladder(aq.q,aq.ov), brand=aq.q.split(/\s+/)[0];
        var qCap=capOf(it.name), qVars=variantsOf(it.name);
        var coreAll=aq.q.split(/\s+/).filter(Boolean).filter(function(t){return t!==brand&&!isNoise(t);});
        var modelNums=coreAll.filter(function(t){return /^\d+$/.test(t)&&parseInt(t,10)>=50;});
        var chosen=null,chosenQ=null,topRaw="",searches=0,lowConf=false,groupN=0;

        for(var c=0;c<cands.length;c++){
          if(searches>0) await sleep(rnd(8000,25000));
          var sr=await post("https://partners.coupang.com/api/v1/search",{page:{pageNumber:0,size:36},filter:cands[c],deliveryTypes:[]}); searches++;
          if(sr.status===429||(sr.json&&sr.json.rCode&&sr.json.rCode!=="0")){R.status="stopped";R.log.push("STOP search "+it.name+" http"+sr.status+" rc"+(sr.json&&sr.json.rCode));return;}
          var ps=(sr.json&&sr.json.data&&sr.json.data.products)||[];
          if(!topRaw&&ps[0]) topRaw=ps[0].title;
          var need=Math.max(1,Math.ceil(coreAll.length*0.6));
          var passers=ps.map(function(p){
            var title=p.title||"";
            var bOK=((p.brands||[]).some(function(b){return b&&(b.indexOf(brand)>-1||brand.indexOf(b)>-1);}))||title.indexOf(brand)>-1;
            var ov=coreAll.filter(function(t){return title.indexOf(t)>-1;}).length;
            var acc=EXCL.some(function(w){return title.indexOf(w)>-1&&it.name.indexOf(w)===-1;});
            var tCap=capOf(title), capBad=(qCap&&tCap&&tCap!==qCap);
            var tVars=variantsOf(title);
            var varBad=tVars.some(function(v){return qVars.indexOf(v)===-1;})||qVars.some(function(v){return tVars.indexOf(v)===-1;});
            var modelOK=modelNums.every(function(n){return title.indexOf(n)>-1;});
            return {p:p,ov:ov,tCap:tCap,pass:(bOK&&ov>=need&&modelOK&&!capBad&&!varBad&&!acc&&p.valid&&!p.isSoldOut)};
          }).filter(function(o){return o.pass;});
          if(!passers.length) continue;
          var best=Math.max.apply(null,passers.map(function(o){return o.ov;}));
          var group=passers.filter(function(o){return o.ov===best;}); groupN=group.length;
          var med=median(group.map(function(o){return o.p.salesPrice||0;}));
          var okg=group.filter(function(o){return (o.p.salesPrice||0)>=0.4*med;});
          okg.sort(function(a,b){return (a.p.salesPrice-b.p.salesPrice)||((b.p.ratingCount||0)-(a.p.ratingCount||0));});
          chosen=okg[0].p; chosenQ=cands[c];
          lowConf=(best<coreAll.length)||(qCap&&!okg[0].tCap);
          break;
        }

        if(!chosen){
          R.results.push({sheetRow:it.sheetRow,name:it.name,status:"not_found",link:"x",price:"",hint:topRaw});
        }else{
          await sleep(rnd(8000,25000));
          var pl={product:{type:"PRODUCT",itemId:chosen.itemId,productId:chosen.productId,vendorItemId:chosen.vendorItemId,image:chosen.image,title:chosen.title,originPrice:chosen.originPrice,salesPrice:chosen.salesPrice,travel:String(chosen.travel),discountRate:null}};
          var dr=await post("https://partners.coupang.com/api/v1/banner/iframe/url",pl);
          if(dr.status===429||(dr.json&&dr.json.rCode&&dr.json.rCode!=="0")){R.status="stopped";R.log.push("STOP deeplink "+it.name+" http"+dr.status+" rc"+(dr.json&&dr.json.rCode));return;}
          var s=(dr.json&&dr.json.data&&dr.json.data.shortUrl)||"";
          R.results.push({sheetRow:it.sheetRow,name:it.name,status:s?(lowConf?"low_conf":"ok"):"no_link",link:s,price:chosen.salesPrice,matchedTitle:chosen.title,usedQ:chosenQ,groupN:groupN});
        }
      }catch(e){R.status=(e.message==="aborted-by-user")?"aborted":"error";R.log.push("ERR "+it.name+" "+e.message);return;}
      if(k<queue.length-1) await sleep(rnd(8000,25000));
      if((k+1)%5===0 && k<queue.length-1) await sleep(rnd(60000,180000));
    }
    if(R.status==="running") R.status="done";
  })();
  return "coupang runner v4 started: "+queue.length+" items";
};
