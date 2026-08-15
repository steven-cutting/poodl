---
title: "Design resource index"
kind: "reference"
audience: [contributor, maintainer, agent]
canonical_for: [design_resource_index]
requires: []
---

# Design resource index

This index collects the actionable sources from the mobile-web, mobile-game and design-
system research used to inform Poodl's design work. It is a directory, not a second source
of product requirements: the Allium specifications decide behaviour, and the repository's
own documentation decides how that behaviour is built and checked.

Every resource has one canonical heading so another page can link to a topic or individual
source and have that fragment checked. Classifications reproduce the research assessment:
**Essential** belongs in a shared curriculum, **Strong** adds depth, and **Tool** or
**Example system** identifies a practical reference rather than assigning a reading
priority. Availability and pricing can change, so confirm them with the provider.

## Browse by topic

| Topic | What it covers |
| --- | --- |
| [Human-centered design and research](#human-centered-design-and-research) | Product discovery, research and usability testing |
| [Mobile web, accessibility, and platform guidance](#mobile-web-accessibility-and-platform-guidance) | Responsive design, accessible interaction, performance and progressive web apps |
| [Design systems, tokens, and component tooling](#design-systems-tokens-and-component-tooling) | System architecture, reusable components, tokens and releases |
| [Mobile game design, UX, and accessibility](#mobile-game-design-ux-and-accessibility) | Mechanics, cognition, onboarding, controls, playtesting and inclusive game design |
| [Analytics and experimentation](#analytics-and-experimentation) | Event models, controlled experiments and game experimentation |
| [Public design systems](#public-design-systems) | Production systems worth studying for patterns, governance and implementation |

## Start here

| Need | Start with | Then add |
| --- | --- | --- |
| Establish an evidence-driven process | [ISO 9241-210](#iso-9241-210), [Double Diamond](#double-diamond) and [GOV.UK user research](#govuk-user-research) | [Usability Testing 101](#usability-testing-101) |
| Make mobile accessibility a design constraint | [WCAG 2.2](#wcag-22) and [WCAG2Mobile](#wcag2mobile) | [Xbox Accessibility Guidelines](#xbox-accessibility-guidelines) for game-specific depth |
| Combine mobile strategy with browser practice | [Mobile First](#mobile-first) and [Responsive Web Design](#responsive-web-design) | [MDN Responsive Web Design](#mdn-responsive-web-design) |
| Treat performance as user experience | [Web Vitals](#web-vitals) | [Lighthouse](#lighthouse) and [PageSpeed Insights](#pagespeed-insights) |
| Build a design system | [Design Systems 101](#design-systems-101) and [Atomic Design](#atomic-design) | [Design Tokens Community Group](#design-tokens-community-group), [Storybook](#storybook) and [Style Dictionary](#style-dictionary) |
| Connect mechanics, cognition and accessibility | [MDA](#mda), [Video Game UX and Psychology](#video-game-ux-and-psychology) and [Xbox Accessibility Guidelines](#xbox-accessibility-guidelines) | [GDC Vault free talks](#gdc-vault-free-talks) and [Game Analytics](#game-analytics) |
| Add measurement after qualitative research | [GOV.UK user research](#govuk-user-research) | [Trustworthy Online Controlled Experiments](#trustworthy-online-controlled-experiments) and an appropriate experimentation tool |

## Recommended paths

- **Mobile-web product designer:** [Double Diamond](#double-diamond),
  [GOV.UK user research](#govuk-user-research), [Mobile First](#mobile-first),
  [MDN Responsive Web Design](#mdn-responsive-web-design), [WCAG2Mobile](#wcag2mobile),
  [Web Vitals](#web-vitals), then
  [Trustworthy Online Controlled Experiments](#trustworthy-online-controlled-experiments).
- **Design-system designer or frontend engineer:**
  [Design Systems 101](#design-systems-101), [Atomic Design](#atomic-design),
  [Design Tokens Community Group](#design-tokens-community-group),
  [Figma Variables](#figma-variables), [Style Dictionary](#style-dictionary),
  [Storybook](#storybook), then [Semantic Versioning](#semantic-versioning).
- **Mobile-game UX designer:** [MDA](#mda), [Rules of Play](#rules-of-play),
  [Video Game UX and Psychology](#video-game-ux-and-psychology),
  [UX of Onboarding and Player Engagement](#ux-of-onboarding-and-player-engagement),
  [Designing for Games](#designing-for-games),
  [Xbox Accessibility Guidelines](#xbox-accessibility-guidelines), then
  [Game Analytics](#game-analytics).
- **Cross-functional product team:** apply the human-centered sources to one pilot feature,
  use the mobile and accessibility sources as acceptance inputs, document component states
  in [Storybook](#storybook), and review qualitative evidence before introducing controlled
  experimentation.

## Human-centered design and research

| Resource | Classification | Best for |
| --- | --- | --- |
| [ISO 9241-210](#iso-9241-210) | Essential | Lifecycle-wide human-centered principles and governance |
| [Double Diamond](#double-diamond) | Essential | Divergent and convergent problem solving |
| [GOV.UK user research](#govuk-user-research) | Essential | Practical continuous-research methods |
| [Usability Testing 101](#usability-testing-101) | Essential | Task-based usability evaluation |

### ISO 9241-210

**Level:** Intermediate/advanced. **Format:** Standard. **Access:** Paid; abstract free.

[ISO 9241-210: Human-centred design for interactive systems](https://www.iso.org/standard/77520.html)
is the formal anchor for human-centered activities throughout an interactive system's
lifecycle. Use it for principles, responsibilities and governance, then pair it with a
methods-oriented source for day-to-day practice.

### Double Diamond

**Level:** Beginner/intermediate. **Format:** Framework and article. **Access:** Free.

The Design Council's [Double Diamond](https://www.designcouncil.org.uk/resources/the-double-diamond/)
provides a shared model for exploring a problem, defining it, exploring possible solutions
and delivering through tests and iteration. It is especially useful when a team is
converging on one polished solution too early.

### GOV.UK user research

**Level:** Beginner through advanced. **Format:** Guide library. **Access:** Free.

The [GOV.UK Service Manual's user-research collection](https://www.gov.uk/service-manual/user-research)
covers planning, recruitment, consent, interviews, contextual research, moderated usability
testing, research with disabled participants and analysis across a service lifecycle. It is
one of the most operational free research references in this index.

### Usability Testing 101

**Level:** Beginner/intermediate. **Format:** Article. **Access:** Free.

Nielsen Norman Group's [Usability Testing 101](https://www.nngroup.com/articles/usability-testing-101/)
is a concise introduction to observing representative participants as they attempt realistic
tasks. Use it to establish the purpose, structure and evidence expected from a usability
test before adopting more specialized methods.

## Mobile web, accessibility, and platform guidance

| Resource | Classification | Best for |
| --- | --- | --- |
| [WCAG 2.2](#wcag-22) | Essential | Normative web accessibility criteria |
| [WCAG2Mobile](#wcag2mobile) | Essential | Applying WCAG to mobile web, native and hybrid apps |
| [WCAG Quick Reference](#wcag-quick-reference) | Tool | Filtering WCAG criteria and techniques |
| [MDN Responsive Web Design](#mdn-responsive-web-design) | Essential | Browser-level responsive implementation |
| [Web Vitals](#web-vitals) | Essential | User-perceived web performance |
| [Mobile First](#mobile-first) | Essential | Mobile-first prioritization strategy |
| [Responsive Web Design](#responsive-web-design) | Essential | Fluid layout foundations |
| [Learn PWA](#learn-pwa) | Strong | Installable and offline-capable web experiences |
| [Apple Human Interface Guidelines](#apple-human-interface-guidelines) | Essential | Interaction expectations from Apple platforms |
| [Android quality and UX guidance](#android-quality-and-ux-guidance) | Essential | Adaptive mobile-app and game quality |
| [Lighthouse](#lighthouse) | Tool | Repeatable lab diagnostics |
| [PageSpeed Insights](#pagespeed-insights) | Tool | Convenient lab and field performance views |
| [Chrome DevTools PWA tools](#chrome-devtools-pwa-tools) | Tool | Manifest, service-worker and storage debugging |

### WCAG 2.2

**Level:** All. **Format:** W3C Recommendation. **Access:** Free.

[Web Content Accessibility Guidelines 2.2](https://www.w3.org/TR/WCAG22/) is the normative
accessibility baseline for web products. Treat its applicable success criteria as inputs to
design and implementation, while remembering that Poodl's named specification guarantees
can be stricter than the general standard.

### WCAG2Mobile

**Level:** Intermediate/advanced. **Format:** W3C guidance. **Access:** Free.

[Guidance on Applying WCAG 2.2 to Mobile Applications](https://www.w3.org/TR/wcag2mobile-22/)
interprets Level A and AA criteria for mobile web, native and hybrid contexts. It is most
useful for translating a general success criterion into concrete mobile interaction and
small-screen considerations.

### WCAG Quick Reference

**Level:** All. **Format:** Filterable reference. **Access:** Free.

The [WCAG 2.2 Quick Reference](https://www.w3.org/WAI/WCAG22/quickref/) filters success
criteria, sufficient techniques and failures by topic and conformance level. Use it as an
implementation companion after the applicable product obligations are understood.

### MDN Responsive Web Design

**Level:** Beginner/intermediate. **Format:** Guide and tutorial. **Access:** Free.

[MDN Responsive Web Design](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/CSS_layout/Responsive_Design)
connects flexible layouts, media queries and modern browser behavior. It complements the
older strategic books with implementation guidance that accounts for current web-platform
capabilities and differing input modalities.

### Web Vitals

**Level:** Intermediate. **Format:** Guide. **Access:** Free.

The [Web Vitals guide](https://web.dev/articles/vitals) explains the metrics used to assess
loading, responsiveness and visual stability. It is the starting point for turning
performance from an engineering afterthought into a measurable part of user experience.

### Mobile First

**Level:** Beginner/intermediate. **Format:** Online book. **Access:** Free to read.

Luke Wroblewski's [Mobile First](https://mobile-first.abookapart.com/) argues for beginning
with constrained space, attention and capability so the essential experience is
prioritized. Its strategic model remains useful even where its implementation examples
need current browser documentation beside them.

### Responsive Web Design

**Level:** Beginner/intermediate. **Format:** Book. **Access:** Paid.

Ethan Marcotte's [Responsive Web Design](https://abookapart.com/products/responsive-web-design.html)
is the foundational treatment of fluid grids, flexible media and media queries. Read it for
the model, then use MDN for current CSS features and browser behavior.

### Learn PWA

**Level:** Intermediate. **Format:** Course and guide. **Access:** Free.

[Learn PWA](https://web.dev/learn/pwa/progressive-web-apps) introduces progressive web-app
capabilities such as installation and offline operation. Use it when those capabilities
materially improve a product rather than adopting a PWA architecture for its label.

### Apple Human Interface Guidelines

**Level:** All. **Format:** Official platform guidance. **Access:** Free.

The [Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines)
document interaction conventions users bring from iPhone, iPad and other Apple products.
For web work, use them to understand expectations without copying native controls where
semantic web primitives are the better implementation.

### Android quality and UX guidance

**Level:** All. **Format:** Official platform guidance. **Access:** Free.

Android's [quality and user-experience guidance](https://developer.android.com/quality/user-experience)
covers adaptive layouts, onboarding, accessibility, localization and monetization timing
for apps and games. The platform-specific advice is useful comparative evidence, not a
replacement for Poodl's web specifications.

### Lighthouse

**Level:** Intermediate. **Format:** Browser tool. **Access:** Free.

[Lighthouse](https://developer.chrome.com/docs/lighthouse/overview) provides repeatable lab
audits for performance, accessibility and related quality areas. Use it to diagnose and
compare implementations, not as a substitute for field data or observation of users.

### PageSpeed Insights

**Level:** Beginner/intermediate. **Format:** Web tool. **Access:** Free.

[PageSpeed Insights](https://pagespeed.web.dev/) is a convenient interface for performance
diagnostics and available field data in Google's web-performance ecosystem. It complements
local lab testing and production evidence.

### Chrome DevTools PWA tools

**Level:** Intermediate. **Format:** Browser-development tools. **Access:** Free.

The [Chrome DevTools PWA documentation](https://developer.chrome.com/docs/devtools/progressive-web-apps)
covers debugging manifests, service workers and storage. It is useful implementation
support when an installable or offline experience is an intentional product requirement.

## Design systems, tokens, and component tooling

| Resource | Classification | Best for |
| --- | --- | --- |
| [Design Systems 101](#design-systems-101) | Essential | Distinguishing a system from a component library |
| [Atomic Design](#atomic-design) | Essential | Component-based interface thinking |
| [Design Tokens Community Group](#design-tokens-community-group) | Essential | Portable token models |
| [Figma Variables](#figma-variables) | Tool | Design-side tokens, modes and aliases |
| [Style Dictionary](#style-dictionary) | Essential | Transforming tokens into platform outputs |
| [Storybook](#storybook) | Essential | Executable component states and documentation |
| [Design Systems by Alla Kholmatova](#design-systems-by-alla-kholmatova) | Strong | Shared language and system architecture |
| [Semantic Versioning](#semantic-versioning) | Strong | Communicating compatible and breaking releases |

### Design Systems 101

**Level:** Beginner/intermediate. **Format:** Article. **Access:** Free.

Nielsen Norman Group's [Design Systems 101](https://www.nngroup.com/articles/design-systems-101/)
is a clear conceptual introduction to the combination of reusable components, patterns,
styles, guidance and the people who maintain and apply them. Start here before selecting
token or component tooling.

### Atomic Design

**Level:** Intermediate. **Format:** Online book. **Access:** Free to read.

Brad Frost's [Atomic Design](https://atomicdesign.bradfrost.com/) presents interfaces as
nested systems rather than isolated pages. It is especially useful for connecting product
design, reusable components, pattern libraries and frontend implementation.

### Design Tokens Community Group

**Level:** Intermediate/advanced. **Format:** Specification and ecosystem. **Access:** Free.

The [Design Tokens Community Group](https://www.designtokens.org/) is the standards-oriented
starting point for portable token data. Use it when token decisions must survive a single
design tool or generate values for multiple implementation platforms.

### Figma Variables

**Level:** Intermediate. **Format:** Design-tool feature. **Access:** Plan-dependent.

[Figma Variables](https://help.figma.com/hc/en-us/articles/18490793776023-Update-1-Tokens-variables-and-styles)
represent design-side values with aliases, modes, scopes and code-oriented names. They are
useful as one interface to a token system, but should not become the system's only portable
source of truth.

### Style Dictionary

**Level:** Advanced. **Format:** Tool and library. **Access:** Free and open source.

[Style Dictionary](https://styledictionary.com/) transforms platform-independent token
data into representations needed by CSS and other targets. It provides the practical
generation layer that complements an interoperable token model.

### Storybook

**Level:** Intermediate/advanced. **Format:** Tool. **Access:** Free and open source.

[Storybook](https://storybook.js.org/) renders components separately from product business
logic and persists hard-to-reach states as stories. That makes it useful for implementation,
documentation, visual review, interaction testing and accessibility checks; Poodl's owning
workflow is [Work in the component workshop](../how-to/work-in-the-component-workshop.md).

### Design Systems by Alla Kholmatova

**Level:** Intermediate. **Format:** Book. **Access:** Paid.

Alla Kholmatova's [Design Systems](https://www.smashingmagazine.com/design-systems-book/)
focuses on shared language, organizing principles and the human work of establishing a
system. It is a useful counterweight to treating design-system adoption as primarily a
tooling problem.

### Semantic Versioning

**Level:** Intermediate/advanced. **Format:** Specification. **Access:** Free.

[Semantic Versioning](https://semver.org/) supplies a conventional contract for signaling
backward-compatible fixes, compatible additions and incompatible API changes. It is most
useful for component libraries whose consumers rely on explicit public interfaces.

## Mobile game design, UX, and accessibility

| Resource | Classification | Best for |
| --- | --- | --- |
| [MDA](#mda) | Essential | Connecting mechanics, dynamics and player experience |
| [Video Game UX and Psychology](#video-game-ux-and-psychology) | Essential | Cognition, attention, HUDs and player learning |
| [UX of Onboarding and Player Engagement](#ux-of-onboarding-and-player-engagement) | Essential | Teaching without overwhelming players |
| [Xbox Accessibility Guidelines](#xbox-accessibility-guidelines) | Essential | Comprehensive accessible game controls and interfaces |
| [Game Accessibility Guidelines](#game-accessibility-guidelines) | Essential | Practical inclusive-game examples and checklists |
| [Designing for Games](#designing-for-games) | Essential | Apple-platform game interaction |
| [MDN mobile touch controls](#mdn-mobile-touch-controls) | Strong | Touch controls for browser games |
| [GDC Vault free talks](#gdc-vault-free-talks) | Strong | Practitioner case studies |
| [Rules of Play](#rules-of-play) | Strong | Meaningful play and game-system theory |
| [Game Analytics](#game-analytics) | Strong | Player, process and performance data |
| [MDN Game Development](#mdn-game-development) | Tool | Web-game APIs, graphics and controls |

### MDA

**Level:** Intermediate/advanced. **Format:** Academic paper. **Access:** Free.

[MDA: A Formal Approach to Game Design and Game Research](https://aaai.org/papers/ws04-04-001-mda-a-formal-approach-to-game-design-and-game-research/)
connects designer-specified mechanics, the dynamics that emerge during play and intended
player experience. It is a durable framework for reasoning about a rule's actual effects
rather than evaluating a feature in isolation.

### Video Game UX and Psychology

**Level:** Intermediate. **Format:** Book companion, articles and talks. **Access:** Mixed.

Celia Hodent's [Video Game UX and Psychology](https://celiahodent.com/video-game-ux-psychology/)
connects cognitive psychology to HUD design, attention, memory load, icon comprehension,
learning priorities and playtest hypotheses. It is a strong bridge between research theory
and day-to-day game UX practice.

### UX of Onboarding and Player Engagement

**Level:** Intermediate. **Format:** Talk, slides and article. **Access:** Free article.

Hodent's [UX of Onboarding and Player Engagement](https://celiahodent.com/gamers-brain-ux-onboarding/)
treats onboarding as learning design and cognitive-load management. It helps teams teach
only what matters for the next meaningful action and test whether players understood it.

### Xbox Accessibility Guidelines

**Level:** All. **Format:** Official guideline library. **Access:** Free.

The [Xbox Accessibility Guidelines](https://learn.microsoft.com/en-us/xbox/accessibility/guidelines)
cover text, contrast, multimodal cues, subtitles, narration, input, difficulty, haptics and
UI navigation. They are one of the broadest official references for accessible game
interfaces and controls.

### Game Accessibility Guidelines

**Level:** Beginner/intermediate. **Format:** Guideline library. **Access:** Free.

[Game Accessibility Guidelines](https://gameaccessibilityguidelines.com/) offers practical,
example-driven recommendations arranged by impact and implementation complexity. It is a
useful complement to platform guidance when prototyping inclusive controls, feedback and
gameplay options.

### Designing for Games

**Level:** Intermediate. **Format:** Official platform guidance. **Access:** Free.

Apple's [Designing for Games](https://developer.apple.com/design/human-interface-guidelines/designing-for-games)
collects game-specific interaction principles, including considerations for touchscreen
controls on iPhone and iPad. Use it to understand platform expectations and test them
against the needs of a web-based game.

### MDN mobile touch controls

**Level:** Intermediate. **Format:** Tutorial. **Access:** Free.

[Mobile touch controls for web games](https://developer.mozilla.org/en-US/docs/Games/Techniques/Control_mechanisms/Mobile_touch)
is an implementation bridge between touch interaction design and browser code. Physical-
device testing remains necessary for reach, occlusion, browser gestures and viewport
changes that desktop simulation cannot reproduce.

### GDC Vault free talks

**Level:** Intermediate/advanced. **Format:** Conference talks. **Access:** Free subset.

The [GDC Vault free collection](https://gdcvault.com/free/gdc-24/) provides practitioner
case studies on onboarding, retention, production and live-game decisions. Use talks as
context-rich examples rather than universal rules.

### Rules of Play

**Level:** Intermediate/advanced. **Format:** Book. **Access:** Paid.

Salen and Zimmerman's [Rules of Play](https://mitpress.mit.edu/9780262240451/rules-of-play/)
is a rigorous foundation for thinking about games as systems that produce meaningful play.
Its conceptual model is durable, while contemporary mobile and live-service practices need
current sources beside it.

### Game Analytics

**Level:** Advanced. **Format:** Academic and practitioner book. **Access:** Paid or
institutional.

[Game Analytics: Maximizing the Value of Player Data](https://link.springer.com/book/10.1007/978-1-4471-4769-5)
treats analytics across players, production processes and technical performance. It is
broader than a retention dashboard, but applying it would require a separate product
decision because Poodl deliberately collects no telemetry.

### MDN Game Development

**Level:** Beginner through advanced. **Format:** Guide library. **Access:** Free.

[MDN Game Development](https://developer.mozilla.org/en-US/docs/Games) is a practical map
of HTML game technologies, graphics, controls and browser APIs. It is the implementation-
oriented companion to the game-design and cognition sources above.

## Analytics and experimentation

Poodl currently has [no analytics or telemetry](../project/purpose-and-scope.md#what-it-deliberately-does-not-do).
These sources remain useful comparative research, but using them would require an explicit
product and privacy decision rather than following this index as implementation guidance.

| Resource | Classification | Best for |
| --- | --- | --- |
| [Trustworthy Online Controlled Experiments](#trustworthy-online-controlled-experiments) | Strong | Rigorous experiment design and operation |
| [Google Analytics events](#google-analytics-events) | Strong | Event-taxonomy concepts |
| [Firebase A/B Testing](#firebase-ab-testing) | Strong | Remote-config experiments across web and mobile |
| [PlayFab Experiments](#playfab-experiments) | Strong | Live-game experimentation |

### Trustworthy Online Controlled Experiments

**Level:** Intermediate/advanced. **Format:** Book. **Access:** Paid.

Kohavi, Tang and Xu's [Trustworthy Online Controlled Experiments](https://www.cambridge.org/core/books/trustworthy-online-controlled-experiments/D97B26382EB0EB2DC2019A7A7B518F59)
is the rigorous foundation in this collection for hypotheses, decision metrics, guardrails,
exposure, stopping rules and organizational experimentation practice.

### Google Analytics events

**Level:** Beginner/intermediate. **Format:** Official documentation. **Access:** Mixed.

The [Google Analytics event model](https://support.google.com/analytics/answer/9322688)
illustrates representing meaningful interactions and occurrences as named events. Its main
value here is event-taxonomy thinking; it is not an authorization to instrument Poodl.

### Firebase A/B Testing

**Level:** Intermediate. **Format:** Tool documentation. **Access:** Service-dependent.

[Firebase A/B Testing](https://firebase.google.com/docs/ab-testing) supports controlled
Remote Config experiments across web and mobile products. It supplies deployment mechanics,
while sound hypotheses and statistical decisions still need an experimentation framework.

### PlayFab Experiments

**Level:** Intermediate/advanced. **Format:** Tool documentation. **Access:** Service-
dependent.

[PlayFab Experiments](https://learn.microsoft.com/en-us/xbox/playfab/live-service-management/game-configuration/experiments/)
is Microsoft's game-specific experimentation tooling for live configuration and feature
tests. It is relevant to operated live games, not Poodl's current static, no-telemetry
architecture.

## Public design systems

Study public systems for the quality of their decisions, behavior, accessibility,
implementation and governance rather than for visual imitation.

| Resource | Classification | Best for |
| --- | --- | --- |
| [U.S. Web Design System](#us-web-design-system) | Example system | Accessible, mobile-friendly public services |
| [Material Design 3](#material-design-3) | Example system | Adaptive mobile foundations and theming |
| [IBM Carbon](#ibm-carbon) | Example system | Enterprise components and contribution quality |
| [Atlassian Design System](#atlassian-design-system) | Example system | Release maturity, governance and deprecation |
| [Adobe Spectrum](#adobe-spectrum) | Example system | Inclusive cross-platform creative applications |
| [Microsoft Fluent 2](#microsoft-fluent-2) | Example system | Cross-platform tokens and components |
| [Salesforce Lightning Design System 2](#salesforce-lightning-design-system-2) | Example system | Large data-heavy enterprise interfaces |
| [Shopify Polaris](#shopify-polaris) | Example system | Commerce, administration and web components |

### U.S. Web Design System

**Format:** Public design system. **Access:** Free and open source.

The [U.S. Web Design System](https://designsystem.digital.gov/) is especially useful for
accessibility, mobile-friendly public services, progressive enhancement and detailed
pattern guidance under strong institutional constraints.

### Material Design 3

**Format:** Public design system. **Access:** Free.

[Material Design 3](https://m3.material.io/) is worth studying for mobile foundations,
adaptive components, interaction patterns, theming, tokens and alignment with the Android
ecosystem.

### IBM Carbon

**Format:** Public design system. **Access:** Free and open source.

[IBM Carbon](https://carbondesignsystem.com/) exposes enterprise-scale component libraries,
design resources, accessibility guidance and contribution expectations. Its public quality
criteria make it particularly useful to reverse-engineer at component level.

### Atlassian Design System

**Format:** Public design system. **Access:** Free.

The [Atlassian Design System](https://atlassian.design/) combines foundations, components,
tools and guidelines with visible maturity and deprecation practices. Study it for system
operations as much as for component design.

### Adobe Spectrum

**Format:** Public design system. **Access:** Free.

[Adobe Spectrum](https://spectrum.adobe.com/) demonstrates a cross-platform design language
for complex creative and productivity applications, with particular value in inclusive
interaction and dense professional workflows.

### Microsoft Fluent 2

**Format:** Public design system. **Access:** Free.

[Microsoft Fluent 2](https://fluent2.microsoft.design/) is a useful reference for cross-
platform foundations, tokens, component architecture and conventions across Microsoft's
product ecosystem.

### Salesforce Lightning Design System 2

**Format:** Public design system. **Access:** Free.

[Salesforce Lightning Design System 2](https://www.lightningdesignsystem.com/) illustrates
the component and pattern needs of a large enterprise ecosystem with data-heavy CRM
interfaces and mature system operations.

### Shopify Polaris

**Format:** Public design system. **Access:** Free.

[Shopify Polaris](https://shopify.dev/docs/api/polaris) is useful for commerce and
administration UX, consistency across product surfaces and a component model centered on
web-platform implementation.

## Using durable and current sources together

Human-centered design, iterative testing, meaningful mechanics, cognitive constraints,
accessibility, modular systems and sound experimentation age relatively slowly. Browser
capabilities, framework APIs, design tools, platform conventions and service offerings
change quickly. Use seminal books and papers to build a mental model, then use W3C, MDN,
platform guidance and current tool documentation when deciding how to implement something
today.

## Related pages

- [Purpose and scope](../project/purpose-and-scope.md)
- [Accessibility](../explanation/accessibility.md)
- [Work in the component workshop](../how-to/work-in-the-component-workshop.md)
