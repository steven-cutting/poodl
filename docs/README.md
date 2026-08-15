---
title: "Documentation map"
kind: "project"
audience: [user, contributor, maintainer, operator, agent]
canonical_for: [documentation_navigation]
requires: []
---

# Documentation map

Every page below is registered in `manifest.yml`, owns at least one topic, and is
reachable from here. That is the whole of the arrangement; the rules behind it are in
[Documentation contract](reference/documentation-contract.md).

Behaviour is specified separately, in Allium, under `docs/specs/` — five modules rooted
at [`words.allium`](specs/words.allium). Those files are not part of this handbook; they
are its subject. Start at [Specifications](explanation/specifications.md) to understand
how the two relate.

## Start here

- [Purpose and scope](project/purpose-and-scope.md) — what Poodl is for, and what it is not.
- [Repository map](project/repository-map.md) — where everything lives.
- [Terminology](project/terminology.md) — the words this repository uses precisely.
- [Make your first change](tutorials/first-change.md) — clone to green gate, once through every layer.

## How to

- [Develop locally](how-to/develop-locally.md)
- [Test and debug](how-to/test-and-debug.md)
- [Work in the component workshop](how-to/work-in-the-component-workshop.md)
- [Work with the specifications](how-to/work-with-the-specs.md)
- [Replace the word lists](how-to/replace-the-word-lists.md)
- [Maintain dependencies](how-to/maintain-dependencies.md)
- [Deploy to GitHub Pages](how-to/deploy-to-github-pages.md)

## Design

- [Design direction](design/direction.md) — how Biscuit Games looks and feels, and why.
- [Design resource index](design/resource-index.md) — research, standards, tools and public
  systems for mobile-web, game and component design.

## Understand

- [Architecture](explanation/architecture.md) — how a static site with no server is put together.
- [Layering and dependency direction](explanation/layering.md) — which module may import which.
- [Specifications](explanation/specifications.md) — why behaviour is written down before it is built.
- [Accessibility](explanation/accessibility.md) — the obligations the specifications state.
- [Security model](explanation/security-model.md) — what a site with no backend does and does not defend.
- [Quality philosophy](explanation/quality-philosophy.md) — why each gate exists.

## Look up

- [Commands](reference/commands.md)
- [Configuration](reference/configuration.md)
- [Testing](reference/testing.md)
- [Quality gates](reference/quality-gates.md)
- [Documentation contract](reference/documentation-contract.md)
- [Agent contract](reference/agent-contract.md)

## Run it

- [Maintenance](operations/maintenance.md)
- [Troubleshooting](operations/troubleshooting.md)

## Decisions

- [Architecture decisions](decisions/README.md) — the record of what was chosen and why.
