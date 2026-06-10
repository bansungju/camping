"""앱 시작 시 JSON 파일을 메모리에 로드. DB 조회 없이 빠른 응답."""
import json, os, glob

SITE_DATA = os.path.join(os.path.dirname(__file__), "..", "site", "data")


class DataStore:
    def __init__(self):
        self.manifest: dict = {}
        self.categories: dict = {}   # slug → category data
        self.search_index: list = []

    def load(self):
        # manifest
        with open(os.path.join(SITE_DATA, "manifest.json"), encoding="utf-8") as f:
            self.manifest = json.load(f)

        # 카테고리별 JSON
        for path in glob.glob(os.path.join(SITE_DATA, "*.json")):
            name = os.path.basename(path).replace(".json", "")
            if name in ("manifest", "search"):
                continue
            with open(path, encoding="utf-8") as f:
                self.categories[name] = json.load(f)

        # 검색 인덱스
        search_path = os.path.join(SITE_DATA, "search.json")
        if os.path.exists(search_path):
            with open(search_path, encoding="utf-8") as f:
                self.search_index = json.load(f)

        print(f"[store] manifest {len(self.manifest.get('categories', []))}카테고리 "
              f"/ 검색인덱스 {len(self.search_index)}개 로드")


data_store = DataStore()
