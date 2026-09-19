# Liquid–Liquid Extraction Simulator

Web Teaching + Research Simulator for multistage, cross-current liquid–liquid extraction of acetic acid (AcOH) from water using fresh ethyl acetate.

## Repository status

This repository currently contains the authoritative V1 specification set; application code, a selected implementation stack, tests, CI, and approved scientific constants have not yet been added.

Read the documentation in this order before implementation:

1. [Project rules](docs/PROJECT_RULES.md)
2. [Authoritative expert decisions](docs/EXPERT_DECISIONS.md)
3. [Project scope](docs/PROJECT_SCOPE.md)
4. [Handover](docs/HANDOVER.md)
5. [Current work queue](docs/TODO.md) and [progress](docs/PROGRESS.md)

## V1 guardrails

- The backend/API is the sole calculation authority; the frontend only renders its immutable stage-result JSON.
- The pure engine uses `mol/L` and `L`, cross-current fresh solvent, one to ten stages, and constant `KD = CE / CR`.
- A user-supplied KD is permitted only with clear provenance and warnings.
- There is no approved default KD, study temperature, KD citation/domain, experimental dataset, or validation acceptance threshold. Do not invent one.
- Animation visualizes precomputed results; it is neither physical extraction time nor CFD.

## Layout

```text
docs/               Authoritative project, model, API, UI, validation, and handover specifications
assets/reference/   Non-authoritative reference material (including the legacy UI concept)
```

The legacy UI concept is visual background only. Its displayed example values and real-time wording are superseded by the authoritative documents.

## Next engineering step

Complete E01 in [TODO](docs/TODO.md): select and document the web stack, test/lint tooling, CI, engine/API/schema versioning, and contributor workflow. Do not start with an unapproved scientific default.
