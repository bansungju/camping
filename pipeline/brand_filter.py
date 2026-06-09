#!/usr/bin/env python3
"""브랜드 필터 — 화이트리스트에 없는 '노네임/셀러' 제품을 rejected 처리.
'브랜드 있는 것만 본다' 결정 구현. 화이트리스트 = 프로젝트의 해자(초기 통찰 재현).

기본은 텐트 카테고리에 적용. --cat 으로 다른 카테고리도 가능.
사용: python3 pipeline/brand_filter.py --db camping_tents500.db
"""
import argparse
import os
import sqlite3

# 실제 캠핑/아웃도어 브랜드 화이트리스트 (한국+글로벌). 확장 가능.
BRANDS = {
    # 국내 텐트/캠핑
    "코베아", "미니멀웍스", "카즈미", "콜핑", "헬스포츠", "제드코리아", "제드", "스노우라인",
    "노스피크", "폴라리스", "캠프365", "배진산업", "몽돌", "로티캠프", "아이두젠", "지오라인",
    "코오롱스포츠", "블랙야크", "K2", "디스커버리", "네파", "밀레", "라푸마", "빈슨메시프",
    "제로그램", "헬리녹스", "버팔로", "캠프타운", "캠프빌리지", "와일드로버", "캠핑문", "벡슬",
    "플라이탑", "스위스마운틴", "카르닉", "울프라운치", "쟈칼", "메사", "하이그라운즈", "트리아브",
    "데이타임", "캠프밸리", "노스페이스", "노스페이스키즈", "피엘라벤",
    "네이처하이크", "켈티", "아이더", "내셔널지오그래픽", "마운틴하이커", "마운틴이큅먼트",
    "노르디스크", "ODC", "스위스알파인클럽", "코오롱", "블랙야크키즈",
    "블랙다이아몬드", "마운티아", "밴프", "코베아키즈",
    # 글로벌
    "스노우피크", "콜맨", "힐레베르그", "니모이큅먼트", "니모", "MSR", "씨투써밋", "테라노바",
    "몽벨", "빅아그네스", "백컨트리", "반고", "MIER", "모비가든", "블랙독", "JEEP", "힐맨",
    "도이터", "살레와", "마무트", "익스페드", "엑스페드", "써머레스트", "오스프리", "그레고리",
    "데카트론", "퀘차", "오자크트레일", "더원더", "빅스카이", "듀랑가",
    # 의자
    "노마드", "미티어소원", "리베로", "지오라인",
    # 랜턴
    "루메나", "나이트코어", "오라이트", "페닉스", "필립스", "스마토", "클레이모어", "밀크", "제스트",
    # 버너
    "제라", "소토", "이와타니", "캡스톤", "지라프", "썬터치", "티에라", "맥선", "동성정밀", "파이브스타",
    # 아이스박스
    "시마노", "스탠리", "이글루", "바낙스", "펠리칸", "대원산업", "해동조구사", "도플갱어아웃도어",
    "코스모스", "YETI", "예티", "이그루", "캠벨",
    # 타프
    "듀랑고", "디노맥스", "아우토반디자인하우스",
    # 침낭
    "준우아웃도어", "다나", "카로프", "듀라맥스", "트라우마", "블랙클라우드",
    # 매트
    "인텍스", "파크론", "카템", "제백", "에어박스", "스패로우",
    # 테이블/코펠/화로대 (가구·취사)
    "라이프타임", "유니프레임", "아베나키", "트란지아", "키이스", "테팔", "AMG티타늄", "벨락",
    "퀸센스", "까사니", "산지기", "웨버", "위너웰", "꾸버스", "레토", "스테츠", "키친아트",
    # 야전침대
    "투마운트", "마운트리버", "삼일정공", "레드스노우", "런웨이브",
    # 웨건
    "엠에스코리아", "로티홈시스", "유한캐스터", "아카시아리빙", "킨즈",
    # 파워뱅크 (전원)
    "에코플로우", "잭커리", "UGREEN", "ROMOSS", "페크론", "삼성", "삼성비즈솔루션",
    "스카이디지탈", "아이에너지", "MAXTILL", "바운드랩", "이지넷유비쿼터스",
}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--db", default=os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "camping_tents500.db"))
    ap.add_argument("--cat", default="텐트", help="적용 카테고리(부분일치). 기본 텐트류 전체")
    ap.add_argument("--apply", action="store_true", help="실제 reject(미지정시 미리보기)")
    args = ap.parse_args()
    con = sqlite3.connect(args.db)

    rows = con.execute("""SELECT b.id, b.name_ko, COUNT(*) FROM products p
        JOIN brands b ON b.id=p.brand_id JOIN categories c ON c.id=p.category_id
        WHERE c.name_ko LIKE ? AND p.curation_status!='rejected'
        GROUP BY b.id ORDER BY COUNT(*) DESC""", (f"%{args.cat}%",)).fetchall()
    keep_b = [(n, c) for _, n, c in rows if n in BRANDS]
    drop_b = [(n, c) for _, n, c in rows if n not in BRANDS]
    keep_n = sum(c for _, c in keep_b)
    drop_n = sum(c for _, c in drop_b)

    print(f"카테고리 '{args.cat}': 브랜드 {len(rows)}개 / 제품 {keep_n+drop_n}")
    print(f"  ✅ 화이트리스트 브랜드 {len(keep_b)}개 / 제품 {keep_n}")
    print(f"  ❌ 노네임·셀러 {len(drop_b)}개 / 제품 {drop_n} (reject 대상)")
    print(f"\n  제외될 브랜드 예시: {', '.join(n+'('+str(c)+')' for n,c in drop_b[:20])}")

    if args.apply:
        con.execute(f"""UPDATE products SET curation_status='rejected'
            WHERE id IN (SELECT p.id FROM products p JOIN brands b ON b.id=p.brand_id
              JOIN categories c ON c.id=p.category_id
              WHERE c.name_ko LIKE ? AND b.name_ko NOT IN ({','.join('?'*len(BRANDS))}))""",
            [f"%{args.cat}%"] + list(BRANDS))
        con.commit()
        print(f"\n→ {drop_n}개 제품 rejected 처리 완료")
    else:
        print("\n(미리보기. 실제 적용은 --apply)")
    con.close()


if __name__ == "__main__":
    main()
