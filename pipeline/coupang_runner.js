// 쿠팡 파트너스 자동링크 인브라우저 러너 v5
// 사용: partners.coupang.com(로그인) 탭에서 이 파일 내용을 execute_javascript로 주입(함수 정의) 후
//       startCoupangRunner(queue, cfg) 호출.
//   queue: [{sheetRow:Number, name:String}, ...]   (시트 B열 제품명)
//   cfg:   {brand_aliases:{...}, query_overrides:{...}}  ← coupang_search_aliases.json 그대로 전달
// 진행/결과: window.__runner = {results, status, i, total, log}.  중단: window.__runner.abort=true
// 안전장치: 검색↔딥링크/상품 사이 랜덤 5~14초(완화), 5건마다 35~80초 휴식, rCode!=0 / HTTP 429 즉시 중단.
//
// v5 개선(2026-06-14):
//   1) SKU코드 제거: 브랜드 뒤 영문4+숫자 덩어리(예 JBEFXUZB171)는 위치 불문 검색에서 제거
//      + 핵심토큰 필수에서도 제외(있으면 가점). 'BD-071' 같은 짧은 모델코드는 유지.
//   2) 사다리 확장: 후행 드롭 대상에 서술접미(에디션/세트/패키지/스타트/단품)와 N.0 버전(4.0 등) 추가.
//      + 위치불문으로 SKU·N.0·서술접미를 제거한 'broad' 후보 1개를 끝에 추가(헬리녹스 노나돔 블랙아웃 케이스).
//   3) '플러스'→'+' 검색 변형을 맨 앞 후보로 추가(쿠팡은 '4+' 표기. 김레 패밀리 4+ 케이스).
//   (이전 v4: 숫자모델번호>=50 유지, 변형토큰 EX/V2/2.0 집합일치, 용량인지, 최저가, 부속품제외)
window.startCoupangRunner = function(queue, cfg){
  cfg = cfg || {};
  var aliases   = cfg.brand_aliases   || {};
  var overrides = cfg.query_overrides || {};
  var EXCL    = ["폴대","그라운드시트","전용","보관함","파우치","케이스","리페어","이너텐트","깔개","플라이시트","풋프린트","수납가방"];
  var VARIANT = ["EX","V2","V3","V4","2.0","3.0","PRO","PLUS","MAX"];
  var DESC    = ["에디션","세트","패키지","스타트","단품"];
  // 버스트 모드용 타이밍(cfg.timing). 기본=v5a 안전값. 버스트는 분단위 지터 권장: {gapMin:15000,gapMax:45000,restMin:0,restMax:0}
  var TM = cfg.timing || {};
  var gMin=TM.gapMin||5000, gMax=TM.gapMax||14000, rMin=(TM.restMin!=null?TM.restMin:35000), rMax=(TM.restMax!=null?TM.restMax:80000);

  window.__abort = false;
  window.__runner = {results:[], status:"running", i:0, total:queue.length, log:[], v:"5a"};
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

  function isSKU(t){return /^[A-Za-z]{4,}\d{2,}[A-Za-z]*$/.test(t);}                 // JBEFXUZB171
  function isVer(t){return /^\d+\.\d+$/.test(t);}                                    // 4.0
  function isDesc(t){return DESC.indexOf(t)>-1;}
  function isDropSearch(t){return /^[A-Za-z]+-?\d+[A-Za-z]*$/.test(t)||/^\d+P$/i.test(t)||/^\d+인용$/.test(t)||/^20\d\d$/.test(t)||/^V\d+$/i.test(t)||/^\d+$/.test(t)||isVer(t)||isDesc(t);}
  // 검증 핵심토큰에서 뺄 "진짜 노이즈": 용량·연도·작은수·N.0버전·SKU코드. 단어·모델번호(>=50)·변형은 유지.
  function isNoise(t){return /^\d+P$/i.test(t)||/^\d+인용$/.test(t)||/^20\d\d$/.test(t)||(/^\d+$/.test(t)&&parseInt(t,10)<50)||isVer(t)||isSKU(t);}
  function capOf(s){var m=(s||"").match(/(\d+)\s*(P|인용)/i);return m?m[1]:null;}
  function variantsOf(s){var up=(s||"").toUpperCase();return VARIANT.filter(function(v){return up.indexOf(v)>-1;});}
  function stripSKU(q){return q.split(/\s+/).filter(function(t){return t&&!isSKU(t);}).join(" ");}
  function aliasQ(name){
    if(overrides[name]) return {q:overrides[name], ov:true};
    for(var k in aliases){ if(name.indexOf(k)===0){ var rest=name.slice(k.length).trim(); return {q:(aliases[k]+(rest?" "+rest:"")).trim(), ov:false}; } }
    return {q:name, ov:false};
  }
  function push1(arr,s){ s=(s||"").trim(); if(s && arr.indexOf(s)===-1) arr.push(s); }
  function ladder(q,ov){
    if(ov) return [q];
    var toks=q.split(/\s+/).filter(Boolean);
    var c=[];
    // 0) 플러스->+ 변형 (맨 앞)
    if(/플러스/.test(q)) push1(c, q.replace(/\s*플러스/g,"+"));
    // 1) 풀네임
    push1(c, toks.join(" "));
    // 2) 후행 드롭 사다리
    var t=toks.slice();
    while(t.length>2){ if(isDropSearch(t[t.length-1])){ t=t.slice(0,-1); push1(c, t.join(" ")); } else break; }
    // 3) 위치불문 broad(SKU/N.0/서술접미 제거) — 끝에 한번 더
    var broad=toks.filter(function(x){return !isVer(x)&&!isDesc(x)&&!isSKU(x);});
    if(broad.length>=2) push1(c, broad.join(" "));
    return c;
  }
  function median(arr){var a=arr.slice().sort(function(x,y){return x-y;});return a[Math.floor(a.length/2)];}

  (async function(){
    for(var k=0;k<queue.length;k++){
      if(R.abort){R.status="aborted";break;}
      var it=queue[k]; R.i=k+1;
      try{
        var aq=aliasQ(it.name); aq.q=stripSKU(aq.q);
        var cands=ladder(aq.q,aq.ov), brand=aq.q.split(/\s+/)[0];
        var qCap=capOf(it.name), qVars=variantsOf(it.name);
        var coreAll=aq.q.split(/\s+/).filter(Boolean).filter(function(t){return t!==brand&&!isNoise(t);});
        var modelNums=coreAll.filter(function(t){return /^\d+$/.test(t)&&parseInt(t,10)>=50;});
        var headTok=coreAll[0]||"";  // 제품명 첫 단어(필수): broad 후보가 서술어만으로 엉뚱한 상품 잡는 것 차단
        var chosen=null,chosenQ=null,topRaw="",searches=0,lowConf=false,groupN=0;

        for(var c=0;c<cands.length;c++){
          if(searches>0) await sleep(rnd(gMin,gMax));
          var sr=await post("https://partners.coupang.com/api/v1/search",{page:{pageNumber:0,size:36},filter:cands[c],deliveryTypes:[]}); searches++;
          // 차단 즉시중단: 429뿐 아니라 403/Access Denied(json=null)·기타 비200·rCode≠0 모두 STOP (false not_found 양산 방지)
          if(sr.status!==200||!sr.json||(sr.json.rCode&&sr.json.rCode!=="0")){R.status="stopped";R.log.push("STOP search "+it.name+" http"+sr.status+" rc"+(sr.json&&sr.json.rCode)+" json"+(!!sr.json));return;}
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
            var headOK=(!headTok||title.indexOf(headTok)>-1);
            return {p:p,ov:ov,tCap:tCap,pass:(bOK&&headOK&&ov>=need&&modelOK&&!capBad&&!varBad&&!acc&&p.valid&&!p.isSoldOut)};
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
          await sleep(rnd(gMin,gMax));
          var pl={product:{type:"PRODUCT",itemId:chosen.itemId,productId:chosen.productId,vendorItemId:chosen.vendorItemId,image:chosen.image,title:chosen.title,originPrice:chosen.originPrice,salesPrice:chosen.salesPrice,travel:String(chosen.travel),discountRate:null}};
          var dr=await post("https://partners.coupang.com/api/v1/banner/iframe/url",pl);
          if(dr.status!==200||!dr.json||(dr.json.rCode&&dr.json.rCode!=="0")){R.status="stopped";R.log.push("STOP deeplink "+it.name+" http"+dr.status+" rc"+(dr.json&&dr.json.rCode)+" json"+(!!dr.json));return;}
          var s=(dr.json&&dr.json.data&&dr.json.data.shortUrl)||"";
          R.results.push({sheetRow:it.sheetRow,name:it.name,status:s?(lowConf?"low_conf":"ok"):"no_link",link:s,price:chosen.salesPrice,matchedTitle:chosen.title,usedQ:chosenQ,groupN:groupN});
        }
      }catch(e){R.status=(e.message==="aborted-by-user")?"aborted":"error";R.log.push("ERR "+it.name+" "+e.message);return;}
      if(k<queue.length-1) await sleep(rnd(gMin,gMax));
      if(rMax>0 && (k+1)%5===0 && k<queue.length-1) await sleep(rnd(rMin,rMax));
    }
    if(R.status==="running") R.status="done";
  })();
  return "coupang runner v5 started: "+queue.length+" items";
};
