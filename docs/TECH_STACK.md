# TECH STACK DECISION — V1

## Status

`APPROVED FOR ENGINEERING FOUNDATION` as a software decision by the Project Owner's documentation-hardening instruction. This document does not approve any scientific constant. Node/browser versions may receive security patches without changing the domain contract; record such changes in `PROGRESS.md`.

## Chosen stack

| Concern | Choice | Why this is enough for V1 | Explicit non-goal |
|---|---|---|---|
| UI | React 19 + TypeScript 5.x | Component composition, typed props, accessible forms | No class-heavy framework |
| Build/dev | Vite 7.x | Fast browser dev server and static production output | No SSR/server runtime |
| Runtime | Node.js 22 LTS | Stable LTS baseline for tooling; browser calculation does not depend on Node at runtime | No Node calculation server |
| Package manager | pnpm 10 via Corepack | Reproducible lockfile and efficient workspace installs | No monorepo until needed |
| Styling | Plain CSS modules or colocated CSS + CSS variables | Small surface, inspectable responsive layout | No enterprise design system |
| Charts | Recharts | React-native declarative charts, tooltips and responsive containers | No custom chart engine |
| Unit/component test | Vitest + Testing Library + `@testing-library/user-event` | Same Vite transform, behavior-oriented tests | No snapshot-only testing |
| Browser E2E | Playwright | Covers stale state, keyboard, responsive and full flow | Use only after UI exists |
| Lint | ESLint flat config, TypeScript ESLint, React Hooks plugin | Catches unsafe imports, hooks and type-adjacent mistakes | No auto-fix in CI without review |
| Format | Prettier | Stable markdown/TS/CSS formatting | Formatting never changes equations semantically |
| Deploy | Firebase Hosting | Static Vite output, preview channels and simple rollback | No Firebase Functions for MVP calculation |
| Optional data | Firebase Firestore modular SDK | Saved scenarios/experiments when persistence task is approved | No persistence requirement for local simulation |
| CI | GitHub Actions | Run install, lint, typecheck, unit, build on pull request | No Docker/Kubernetes pipeline |

The version ranges above are engineering targets, not evidence that a package is already installed. `ENG-001` must create `package.json`, `pnpm-lock.yaml`, `.nvmrc`/tool-version file and config files; until then no command is expected to run.

## Runtime boundary

The browser executes:

```text
React event -> domain validation -> normalization -> pure engine
  -> immutable SimulationResult -> state machine -> presentation
```

No calculation requires network, Firebase, authentication or a server. Firestore calls are isolated behind `src/firebase/` adapters and are never imported by `src/domain/`. A save failure may prevent persistence but must not corrupt an already calculated local snapshot.

## Suggested scripts

`package.json` should expose exactly these names, with no script silently doing scientific work:

| Script | Expected command purpose |
|---|---|
| `dev` | Start Vite development server |
| `build` | Typecheck/build static `dist/` |
| `preview` | Serve built static output locally |
| `lint` | ESLint over source/tests/config |
| `format` | Prettier check or write, explicitly selected |
| `typecheck` | `tsc --noEmit` |
| `test` | Vitest unit/component tests |
| `test:coverage` | Vitest coverage for domain and UI |
| `test:e2e` | Playwright, opt-in local/CI browser flow |

## Toolchain constraints

1. Enable Corepack and use the committed pnpm lockfile.
2. TypeScript strict mode is required; do not add `any` to domain contracts without a comment and test.
3. Avoid runtime enums when a string union is sufficient; keep serialized field names stable.
4. Domain modules must be importable in a Node/Vitest environment without DOM, React or Firebase.
5. Graph library receives chart arrays; it does not receive raw input and must not derive chemistry.
6. Firebase configuration is public client configuration, but Firestore security rules and data minimization remain required before persistence.
7. CI runs without Firebase credentials for core tests. Firebase emulator tests are a separate task.

## Directory target

```text
src/
  app/                 composition, routing, top-level providers
  components/          input, simulation, results, charts, common UI
  domain/
    models/            TypeScript contracts from DATA_MODEL
    validation/         parsing/normalization/errors
    calculation/       pure stage and simulation functions
    constants/          only software constants (no unapproved KD/temp)
  simulation/
    state-machine/     reducer, events, playback clock adapter
    visualization/     SVG geometry and particle mapping
  firebase/            optional persistence adapters only
  pages/               mode-level page composition
  hooks/               UI hooks, never chemistry formulas
  utils/               formatting, CSV parsing, accessibility helpers
tests/                 shared fixtures, contract/e2e support as appropriate
```

## Acceptance for ENG-001

Fresh clone can run `corepack enable`, `pnpm install`, `pnpm lint`, `pnpm typecheck`, `pnpm test` and `pnpm build` with a trivial shell page. There is no calculation implementation in this task. The next task may import domain contracts only after this baseline is green.
