#!/usr/bin/env bash
# Render D2 diagrams to light (<id>.svg) and dark (<id>.dark.svg) SVGs.
#
#   scripts/render-diagrams.sh                 # render all content/**/figures/*.d2
#   scripts/render-diagrams.sh path/to/x.d2    # render specific files
#   scripts/render-diagrams.sh --check         # exit 1 if any SVG is stale or missing
#
# Colors come from content/_shared/d2/palette-{light,dark}.d2. Diagrams import `base`
# (light); for the dark variant this script renders a temporary copy importing `base-dark`.
set -euo pipefail

LIGHT_THEME=0
DARK_THEME=200

command -v d2 >/dev/null || { echo "d2 not found — install with: brew install d2" >&2; exit 1; }

check=false
files=()
for arg in "$@"; do
  case "$arg" in
    --check) check=true ;;
    *) files+=("$arg") ;;
  esac
done

if [ ${#files[@]} -eq 0 ]; then
  while IFS= read -r f; do files+=("$f"); done < <(find content -path '*/figures/*.d2' ! -name '.*' | sort)
fi

tmp="$(mktemp -d)"
dark_sources=()
cleanup() {
  rm -rf "$tmp"
  for f in "${dark_sources[@]+"${dark_sources[@]}"}"; do rm -f "$f"; done
}
trap cleanup EXIT

# render <theme> <source> <output>
render() {
  if ! d2 --theme "$1" "$2" "$3" >"$tmp/log" 2>&1; then
    cat "$tmp/log" >&2
    exit 1
  fi
  chmod 644 "$3"
}

stale=0
for src in "${files[@]}"; do
  base="${src%.d2}"
  # Same directory as the source so relative imports resolve identically.
  dark_src="$(dirname "$src")/.$(basename "$base").dark.d2"
  sed 's#_shared/d2/base$#_shared/d2/base-dark#' "$src" >"$dark_src"
  dark_sources+=("$dark_src")

  for variant in light dark; do
    if [ "$variant" = light ]; then
      theme=$LIGHT_THEME; input="$src"; out="$base.svg"
    else
      theme=$DARK_THEME; input="$dark_src"; out="$base.dark.svg"
    fi
    if $check; then
      render "$theme" "$input" "$tmp/out.svg"
      if ! cmp -s "$tmp/out.svg" "$out"; then
        echo "stale: $out" >&2
        stale=1
      fi
    else
      render "$theme" "$input" "$out"
      echo "rendered: $out"
    fi
  done
  rm -f "$dark_src"
done

if $check && [ "$stale" -ne 0 ]; then
  echo "Run pnpm diagrams to regenerate." >&2
  exit 1
fi
