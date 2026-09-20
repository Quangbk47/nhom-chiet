# EQUILIBRIUM MODEL — V1 CONSTANT KD

## Purpose

V1 implements exactly one equilibrium relationship and keeps scientific provenance distinct from an arithmetic input. The pure browser engine accepts the relationship; Firebase and UI do not define it.

## Definition

For every stage of a declared run:

```text
KD = CE / CR
```

`CE` is AcOH concentration in nominal EtOAc extract and `CR` is AcOH concentration in nominal aqueous raffinate. Both are mol/L; KD is dimensionless. KD is constant across stage number for this run.

V1 does not implement `KD(C)`, activity coefficients, ternary tie-lines, an equilibrium curve or regression. A submitted KD is a model input, not evidence that the real system reaches that value.

## Provenance contract

| Field | Contract | Action |
|---|---|---|
| `kd.value` | finite number >0 | hard validation error otherwise |
| `kd.sourceType` | `user_supplied` or `project_approved` | reject unknown |
| `kd.referenceIdOrNote` | non-empty text | required for both; approved must resolve record |
| `kd.validityDomainNote` | text or null | null gives warning |
| `temperature.status` | `declared` | required for every V1 run |
| `temperature.valueC` | exactly `25` | fixed V1 standard; a different temperature is outside this contract |
| `modelId` | `constant-kd-v1` | reject other model |

For `project_approved`, the application may select only a record with status Project Owner Approved, matching convention/value/version, system, temperature and domain. If no such local/reference record exists, return `UNAPPROVED_CONSTANT`; do not silently downgrade. For `user_supplied`, calculate and include `USER_SUPPLIED_KD` warning.

## Required UI language

- User KD: `User-supplied KD — not a project-approved default.`
- Fixed temperature: `V1 standard condition: 25 °C.`
- Missing domain: `KD validity domain is not supplied; this result is exploratory.`
- Constant model: `Equilibrium assumed; KD is held constant for this run.`

## Data lifecycle

Candidate → Reviewed → Project Owner Approved is a versioned transition. Old snapshots retain original reference/version. User-supplied KD never creates a reference record automatically. The register and review checklist live in `REFERENCE_DATA.md`.

## Applicability gate

If a declared experiment falls outside the approved temperature/domain, flag `CONDITION_OUTSIDE_DECLARED_DOMAIN` and permit calculation only as exploratory. No V1 code may claim universal AcOH–water–EtOAc equilibrium.
