# EQUILIBRIUM MODEL — V1 CONSTANT KD

## 1. Purpose
This document defines the only equilibrium contract implemented in V1. It prevents an ambiguous use of the term “distribution coefficient” and separates scientific data status from an arithmetic input.

## 2. Locked model definition
For every stage of one run:

`KD = CE / CR`

`CE` is AcOH concentration in the nominal ethyl-acetate extract phase; `CR` is AcOH concentration in nominal aqueous raffinate phase; both are mol/L. KD is dimensionless only because the same concentration unit is used for numerator and denominator. V1 holds this value constant across stage number and within the submitted run.

V1 does not implement `KD(C)`, activity coefficients, ternary tie lines, a distribution curve, or a regression. A value supplied in a request is a declared input to the model, not proof of the equilibrium of the real system.

## 3. Required provenance contract
Every calculation must carry the following object and return it unchanged in result metadata.

| Field | Allowed value | Validation/action |
|---|---|---|
| `kd.value` | finite number >0 | hard error otherwise |
| `kd.sourceType` | `user_supplied`, `project_approved` | hard error if unknown |
| `kd.referenceIdOrNote` | nonempty text | required for user-supplied; approved ID must exist |
| `kd.validityDomainNote` | text/null | null yields warning, not invented domain |
| `temperature.status` | `pending`, `declared` | required |
| `temperature.valueC` | finite number/null | only allowed when status declared |
| `modelId` | `constant-kd-v1` | server assigned/validated |

If `sourceType=project_approved`, server must resolve an Approved `REFERENCE_DATA` record with matching KD convention, value/version, temperature and domain. If no matching record exists, reject request `UNAPPROVED_CONSTANT`. If `sourceType=user_supplied`, calculate but return `USER_SUPPLIED_KD` warning.

## 4. Data-status lifecycle
Candidate data may be found in a paper, spreadsheet, or preliminary lab notebook. Reviewed data has had identity, units, system, temperature, source and domain checked by a named reviewer. Project Owner Approved data has an explicit approval date and permitted scope. Only the last status can populate a selectable default. Reclassification creates a new version/audit record; it never mutates the provenance of old simulations.

## 5. Required UI language
For approved KD: show reference ID, value, study temperature and stated valid domain. For user KD: show `User-supplied KD — not a project-approved default.` For pending temperature: show `V1 fixed study temperature has not yet been approved; this run stores no default temperature.` Do not use vague green “valid” styling as a substitute for this text.

## 6. Validity and non-claims
The model must state that constant KD is an assumption intended for the declared context. It must not claim universal AcOH–water–ethyl acetate equilibrium. If an experiment is outside the provenance temperature/domain, the application flags `CONDITION_OUTSIDE_DECLARED_DOMAIN` and may calculate only as exploratory user-supplied input.

## 7. Future V2 boundary
V2 requires a separately approved equation `CE=f(CR)`, fit/data provenance, numerical root-solver convergence rule, bounds, failure handling and validation plan. None of those fields or calculation paths should be silently enabled under V1.

## 8. Tests
Test positive user KD calculates with warning; zero/negative/nonfinite KD rejects; unapproved project constant rejects; approved reference is returned as versioned provenance; output uses same KD at every stage; UI exposes warning/domain/temperature status; no V2 equation is accepted by V1 API.
