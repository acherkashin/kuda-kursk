<!--
Sync Impact Report
Version change: 1.0.0 -> 2.0.0
Modified principles:
- Previous principle III -> III. User-approved testing
Added sections:
- None
Removed sections:
- None
Templates requiring updates:
- ✅ .specify/templates/plan-template.md
- ✅ .specify/templates/spec-template.md
- ✅ .specify/templates/tasks-template.md
- N/A .specify/templates/commands/*.md (directory absent)
Runtime guidance:
- ✅ AGENTS.md updated with explicit test-approval rule
Follow-up TODOs:
- None
-->

# Kursk Places Map Constitution

## Core Principles

### I. Simplicity, Readability, and Maintainability

Code MUST follow SOLID, KISS, and DRY when those principles improve the current
task instead of creating ceremony for its own sake. Readability and
maintainability are MORE IMPORTANT than clever solutions: names, structure, and
data flow MUST be understandable to the next engineer without reconstructing
hidden intent. New abstractions are ALLOWED only when they clearly benefit the
current complexity, reuse, or responsibility boundaries.

Rationale: the project must evolve quickly without accumulating fragile
solutions that block the map release or future product directions.

### II. Separation of Concerns

Functions, hooks, helper files, classes, and React components MUST remain small,
focused, and single-purpose. React components MUST be responsible for rendering,
UI composition, and local interface state; non-trivial business logic,
filtering, data transformation, content import, analytics, and domain rules
MUST be moved into hooks, helpers, services, or other focused modules. UI logic
and business logic MUST NOT be mixed when doing so makes behavior harder to
test, reuse, or understand.

Rationale: the map, search, collections, place cards, and future scenarios must
remain testable and changeable without rewriting the interface layer.

### III. User-Approved Testing

New or changed automated tests MUST NOT be added unless the user explicitly
requests or approves them. When an executor believes new test coverage would be
useful, they MUST explain the relevant risk briefly and ask for permission before
creating or expanding unit, integration, e2e, contract, or regression tests.
Existing tests MAY be run as regression checks when appropriate, but running
existing checks does not authorize new test coverage. Plans and tasks MUST record
the chosen verification method without automatically adding test tasks.

Rationale: verification should remain intentional and useful without creating
test coverage the user did not ask to maintain.

### IV. Consistent User Experience

The interface MUST follow existing project patterns, preserve a coherent visual
language, and keep behavior equally understandable on desktop and mobile
screens. User flows MUST NOT contain content overlaps, inaccessible controls,
inconsistent states, empty placeholders instead of hidden optional data, or
visual noise that competes with the map's core value. New interface states MUST
account for loading, empty results, third-party service errors, mobile
interaction, and accessibility of primary actions.

Rationale: residents and tourists should quickly understand where to go instead
of decoding an inconsistent interface.

### V. Performance Without Premature Optimization

Solutions MUST NOT be optimized in advance without a confirmed need, but they
MUST avoid obviously inefficient algorithms, unnecessary rerenders, unbounded
work on each input, and heavy operations in critical UI paths. Map, search,
filter, and place-card features MUST account for the first release's target
scale, including publication of at least 500 places and responses that users
perceive as fast. Performance-oriented solutions MUST remain readable and
justified by current requirements.

Rationale: the full-screen map and search must feel fast, but the project must
not pay complexity costs for hypothetical problems.

## Technical Constraints

Edge cases MUST be handled explicitly: incomplete place data, different photo
variants, unknown community-map links, external map errors, mobile screen sizes,
nearby marker coordinates, and imported geodata details. Implementation MUST
respect existing conventions, project structure, and already chosen patterns.
Future product directions (accounts, saved places, Telegram entry points, user
submissions) MUST be considered as compatibility boundaries, but MUST NOT
complicate the first version without a direct requirement.

## Development and Verification Process

Each implementation plan MUST pass the Constitution Check before research and
again after design. Review MUST check solution simplicity, responsibility
boundaries, verification strategy, explicit handling of edge cases, UX
consistency, and sufficient performance for the stated scale. Tasks MUST record
approved checks: existing automated tests, manual scenarios, visual
verification, responsive behavior checks, performance checks, or newly approved
test coverage. Deviations from the principles MUST be described in Complexity
Tracking with the reason and the simpler alternative that was rejected.

## Governance

This constitution takes priority over local development habits and
recommendations that conflict with it. Constitution changes MUST include the
reason, semver version change, updated Last Amended date, and verification of
dependent Spec Kit templates. The MAJOR version is used for incompatible changes
to principles or governance, the MINOR version is used for new or substantially
expanded principles and required sections, and the PATCH version is used for
clarifications that do not change meaning.

Before completing a feature plan, tasks, or implementation, the executor MUST
verify that the current work complies with this constitution. If a principle is
intentionally violated, the violation MUST be explicitly documented with the
reason, risk, and simpler alternative that was rejected.

**Version**: 2.0.0 | **Ratified**: 2026-05-28 | **Last Amended**: 2026-06-01
