#!/usr/bin/env bash
# End-to-end smoke test of every backend API endpoint group.
# Prereqs: backend running with the new .env; local_supabase_schema.sql applied.
# Usage:  bash database/run_all_apis.sh
# Env:    API_BASE (default http://localhost:3000/api/v1)
set -u
cd "$(dirname "$0")/.."
BASE="${API_BASE:-http://localhost:3000/api/v1}"
BODY=/tmp/xx_api_body

pass=0; fail=0
declare -a FAILURES=()

report() { # name code
  if [[ "$2" =~ ^[23] ]]; then
    echo "PASS [$2] $1"; pass=$((pass+1))
  else
    echo "FAIL [$2] $1  $(head -c 160 "$BODY" 2>/dev/null)"
    fail=$((fail+1)); FAILURES+=("$1")
  fi
}

req() { # method path body auth [extra path params already in path]
  local method="$1" path="$2" body="${3:-}" auth="${4:-}"
  local -a args=(-s -o "$BODY" -w "%{http_code}" -X "$method" "$BASE$path" -H "Content-Type: application/json")
  [ -n "$body" ] && args+=(-d "$body")
  [ -n "$auth" ] && args+=(-H "Authorization: Bearer $auth")
  curl "${args[@]}" --max-time 45
}

TOKEN=""
ADMIN_TOKEN=""

echo "================ PUBLIC ================"
report "GET /health (server root)"           "$(req GET "/health" "")"
report "GET /system/status"                  "$(req GET "/system/status" "")"
report "GET /results (public read)"          "$(req GET "/results" "")"

echo "================ AUTH ================"
report "POST /auth/register"                 "$(req POST "/auth/register" '{"name":"smoke user","mobile":"9999999990","password":"12345678"}')"
report "POST /auth/login (7247242931)"       "$(req POST "/auth/login" '{"mobile":"7247242931","password":"12345678"}')"
TOKEN=$(python3 -c "import json;print(json.load(open('$BODY'))['data'].get('accessToken') or json.load(open('$BODY'))['data'].get('token') or '')" 2>/dev/null || true)
if [ -z "$TOKEN" ]; then
  echo "!! Login did not return a token — cannot test authenticated endpoints."
  echo "=== Summary: $pass passed, $fail failed. Login failed; fix schema/admin first ==="
  exit 1
fi
echo "(got access token, ${#TOKEN} chars)"
report "GET /auth/me"                        "$(req GET "/auth/me" "" "$TOKEN")"

echo "================ USER (auth token) ================"
report "GET  /games"                         "$(req GET "/games" "" "$TOKEN")"
report "GET  /games/popular"                 "$(req GET "/games/popular" "" "$TOKEN")"
report "GET  /rounds"                        "$(req GET "/rounds" "" "$TOKEN")"
report "GET  /rounds/upcoming"               "$(req GET "/rounds/upcoming" "" "$TOKEN")"
report "GET  /results/latest"                "$(req GET "/results/latest" "" "$TOKEN")"
report "GET  /activities/transactions"       "$(req GET "/activities/transactions" "" "$TOKEN")"
report "GET  /points/wallet"                 "$(req GET "/points/wallet" "" "$TOKEN")"
report "GET  /points/transactions"           "$(req GET "/points/transactions" "" "$TOKEN")"
report "GET  /bonuses/active"                "$(req GET "/bonuses/active" "" "$TOKEN")"
report "GET  /bonuses/my-claims"             "$(req GET "/bonuses/my-claims" "" "$TOKEN")"
report "GET  /referrals/me"                  "$(req GET "/referrals/me" "" "$TOKEN")"
report "GET  /referrals/leaderboard"         "$(req GET "/referrals/leaderboard" "" "$TOKEN")"
report "GET  /notifications"                 "$(req GET "/notifications" "" "$TOKEN")"
report "GET  /notifications/unread-count"    "$(req GET "/notifications/unread-count" "" "$TOKEN")"
report "GET  /banners"                       "$(req GET "/banners" "" "$TOKEN")"
report "GET  /settings"                      "$(req GET "/settings" "" "$TOKEN")"

echo "================ ADMIN ================"
report "POST /admin/auth/login"              "$(req POST "/admin/auth/login" '{"email":"admin@shrijibazaar.com","password":"admin123"}')"
ADMIN_TOKEN=$(python3 -c "import json;d=json.load(open('$BODY'))['data'];print(d.get('token') or d.get('accessToken') or '')" 2>/dev/null || true)
if [ -z "$ADMIN_TOKEN" ]; then
  echo "SKIP admin list endpoints (admin login failed — check admin seed)"
else
  report "GET /admin/dashboard"              "$(req GET "/admin/dashboard" "" "$ADMIN_TOKEN")"
  report "GET /admin/users/list"             "$(req GET "/admin/users/list" "" "$ADMIN_TOKEN")"
  report "GET /admin/games"                  "$(req GET "/admin/games" "" "$ADMIN_TOKEN")"
  report "GET /admin/rounds"                 "$(req GET "/admin/rounds" "" "$ADMIN_TOKEN")"
  report "GET /admin/results"                "$(req GET "/admin/results" "" "$ADMIN_TOKEN")"
  report "GET /admin/banners"                "$(req GET "/admin/banners" "" "$ADMIN_TOKEN")"
  report "GET /admin/settings"               "$(req GET "/admin/settings" "" "$ADMIN_TOKEN")"
  report "GET /admin/activities"             "$(req GET "/admin/activities" "" "$ADMIN_TOKEN")"
  report "GET /admin/points/wallet"          "$(req GET "/admin/points/wallet" "" "$ADMIN_TOKEN")"
  report "GET /admin/notifications"          "$(req GET "/admin/notifications" "" "$ADMIN_TOKEN")"
  report "GET /admin/payments/pending/deposits"     "$(req GET "/admin/payments/pending/deposits" "" "$ADMIN_TOKEN")"
  report "GET /admin/payments/pending/withdrawals"  "$(req GET "/admin/payments/pending/withdrawals" "" "$ADMIN_TOKEN")"
  report "GET /admin/referrals"              "$(req GET "/admin/referrals" "" "$ADMIN_TOKEN")"
fi

echo
if [ "$fail" -eq 0 ]; then
  echo "=== ALL GREEN: $pass passed, 0 failed ==="
else
  echo "=== $pass passed, $fail failed ==="
  for f in "${FAILURES[@]}"; do echo "  - $f"; done
fi
