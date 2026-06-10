"""devagent/paths.py — 하네스/레포 경로 상수 (단일 출처)."""
from __future__ import annotations

import os

# devagent/ 의 부모 = dev-harness/, 그 부모 = repo root (camping/)
PKG_DIR = os.path.dirname(os.path.abspath(__file__))
HARNESS_ROOT = os.path.dirname(PKG_DIR)               # .../camping/dev-harness
REPO_ROOT = os.path.dirname(HARNESS_ROOT)             # .../camping

SSOT_DIR = os.path.join(HARNESS_ROOT, "ssot")
SSOT_REGISTRY = os.path.join(SSOT_DIR, "registry.yaml")
STATE_JSON = os.path.join(HARNESS_ROOT, "state.json")
ACTIVE_JSON = os.path.join(HARNESS_ROOT, "active.json")
PROGRESS_MD = os.path.join(HARNESS_ROOT, "PROGRESS.md")
CHECKPOINTS_DB = os.path.join(HARNESS_ROOT, ".checkpoints.db")
LEDGER_LOCK = os.path.join(HARNESS_ROOT, ".ledger.lock")
WORKTREE_DIR = os.path.join(HARNESS_ROOT, ".dev-harness-wt")
