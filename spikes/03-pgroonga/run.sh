#!/usr/bin/env bash
# 用法：./run.sh local [cfg] [mode]    或    ./run.sh staging [cfg] [mode]
# 全程在 transaction 內並 ROLLBACK，不留任何 spike 資料。cfg/mode 只決定最後「未命中清單」顯示哪一組。
set -euo pipefail
cd "$(dirname "$0")"
TARGET=${1:-local}; CFG=${2:-2}; MODE=${3:-FS}
SQL=$( (echo "begin;"; cat 01_data.sql 02_run.sql 03_probe.sql; echo "rollback;") )
if [ "$TARGET" = local ]; then
  printf '%s\n' "$SQL" | docker exec -i supabase_db_ss-star-map psql -U postgres -v ON_ERROR_STOP=1 \
    -v miss_cfg="$CFG" -v miss_mode="$MODE" -P pager=off
else
  set -a; . ../../.env.staging.local; set +a
  printf '%s\n' "$SQL" | docker run --rm -i -e PGPASSWORD="$SUPABASE_STAGING_DB_PASSWORD" postgres:17 \
    psql -h aws-0-ap-northeast-1.pooler.supabase.com -p 5432 -U postgres.hsrtjqjtylzospbcvtho -d postgres \
    -v ON_ERROR_STOP=1 -v miss_cfg="$CFG" -v miss_mode="$MODE" -P pager=off
fi
