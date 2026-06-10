#!/bin/bash
# 노트북 → Mac mini 배포 스크립트
# 사용법: ./deploy-to-mini.sh

set -e
MINI="mimi@192.168.45.54"
REMOTE_DIR="~/camping"

echo "▶ 노트북 변경사항 push..."
git push origin main

echo "▶ Mac mini에서 pull..."
ssh "$MINI" "cd $REMOTE_DIR && git pull origin main"

echo "✓ 완료"
