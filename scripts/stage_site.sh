#!/bin/sh
set -eu

# Assembles what GitHub Pages serves: the domain root, with the built app
# beneath it at BASE_PATH.
#
# Poodl owns pnut.fans, and a repository's own domain is served from its root
# rather than from a subdirectory. The root is a landing page, not the game, so
# the artefact is not the build directory itself — it is a small tree with the
# build moved into place inside it. See decision 0009.
#
# BASE_PATH decides where the app lands, and it is the same value the build was
# given. Passing one and not the other produces a site whose pages load but
# whose hand-written paths point at nothing, which is the failure
# docs/reference/configuration.md describes; `:?` makes the omission say so
# instead.
#
# This is a script rather than a `run:` block because actionlint does not read
# workflow shell, so shell that lives in a workflow is shell nothing checks.

project_root=$(CDPATH='' cd -- "$(dirname -- "$0")/.." && pwd -P)
cd "$project_root"

# Every check comes before anything is created or removed, so an invocation that
# was never going to work leaves the worktree exactly as it found it.
: "${BASE_PATH:?BASE_PATH must name the path the app was built for}"
test -d build || {
  printf '%s\n' 'build/ is missing; run a build with the same BASE_PATH first' >&2
  exit 2
}

# The design system is a dependency now, so this script reads it from there
# rather than from a copy in src/. Checked with the other two above.
package=node_modules/@steven-cutting/biscuit-games
test -f "$package/src/app.css" || {
  printf '%s\n' "$package is missing; run just sync first" >&2
  exit 2
}

rm -rf site
mkdir -p site

# The dot copies the hidden files too, .nojekyll among them.
cp -R site-root/. site/

# The landing page wears the design system's tokens rather than a second
# palette, and takes them from the package the app takes them from.
# tests/contrast.test.ts measures this same file out of node_modules; a copy
# beside the page is what puts the page inside that gate.
cp "$package/src/app.css" site/app.css

# The faces the same stylesheet names, at the path it names them by. Its three
# url()s are relative to itself and unchanged by the move, so the mirror has to
# sit beside the copy. Inside the app those url()s go through Vite, which hashes
# the files and rewrites them; this copy is raw, so the browser resolves them
# against site/app.css and has to find something there. Mirroring the package's
# own layout is what lets the stylesheet be copied rather than rewritten, and a
# rewrite is the one thing that would put a second, drifting copy of it here.
mkdir -p site/lib/assets/fonts
cp "$package"/src/lib/assets/fonts/*.woff2 site/lib/assets/fonts/

mv build "site${BASE_PATH}"
