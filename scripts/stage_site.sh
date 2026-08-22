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

# Both checks come before anything is created or removed, so an invocation that
# was never going to work leaves the worktree exactly as it found it.
: "${BASE_PATH:?BASE_PATH must name the path the app was built for}"
test -d build || {
  printf '%s\n' 'build/ is missing; run a build with the same BASE_PATH first' >&2
  exit 2
}

rm -rf site
mkdir -p site

# The dot copies the hidden files too, .nojekyll among them.
cp -R site-root/. site/

# The landing page wears the application's own tokens rather than a second
# palette. tests/contrast.test.ts enumerates the figures in this file; a copy
# beside the page is what puts the page inside that gate.
cp src/app.css site/app.css

mv build "site${BASE_PATH}"
