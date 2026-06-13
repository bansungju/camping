"""앱 시작 시 JSON 파일을 메모리에 로드. DB 조회 없이 빠른 응답."""
import json, os, glob

SITE_DATA = os.path.join(os.path.dirname(__file__), "..", "site", "data")


class DataStore:
    def __init__(self):
        self.manifest: dict = {}
        self.categories: dict = {}   # slug → category data
        self.search_index: list = []

    def load(self):
        # manifest — M-432: 부재·파싱오류가 lifespan까지 전파돼 서버 기동이 죽지 않게 빈 상태로 폴백(+경고).
        #   (search.json은 os.path.exists 가드가 있어 불일치했다.)
        try:
            with open(os.path.join(SITE_DATA, "manifest.json"), encoding="utf-8") as f:
                self.manifest = json.load(f)
        except (FileNotFoundError, json.JSONDecodeError) as e:
            print(f"[store] ⚠ manifest.json 로드 실패({e}) — 빈 상태로 기동")
            self.manifest = {}

        # 카테고리별 JSON — M-443: glob('*.json')은 임시·OCR 아티팩트 파일까지 카테고리로 로드해
        #   /api/category/<name>으로 노출시킨다 → manifest에 등재된 슬러그만 허용목록으로 로드.
        allowed = {c.get("slug") for c in self.manifest.get("categories", []) if c.get("slug")}
        for path in glob.glob(os.path.join(SITE_DATA, "*.json")):
            name = os.path.basename(path).replace(".json", "")
            if name in ("manifest", "search") or name not in allowed:
                continue
            try:
                with open(path, encoding="utf-8") as f:
                    self.categories[name] = json.load(f)
            except (json.JSONDecodeError, OSError) as e:
                print(f"[store] ⚠ {name}.json 로드 실패({e}) — 스킵")

        # 검색 인덱스
        search_path = os.path.join(SITE_DATA, "search.json")
        if os.path.exists(search_path):
            with open(search_path, encoding="utf-8") as f:
                self.search_index = json.load(f)

        print(f"[store] manifest {len(self.manifest.get('categories', []))}카테고리 "
              f"/ 검색인덱스 {len(self.search_index)}개 로드")


data_store = DataStore()
