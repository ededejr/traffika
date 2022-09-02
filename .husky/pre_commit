#!/bin/sh
[ -n "$CI" ] && exit 0
. "$(dirname "$0")/_/husky.sh"

if npm run lint:check; then
  echo "Lint ✅"
  exit 0
fi

npm run lint