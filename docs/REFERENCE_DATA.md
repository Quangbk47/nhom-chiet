# REFERENCE DATA AND SCIENTIFIC PROVENANCE

## 1. Purpose
This register is the sole source for whether a scientific datum is merely found, reviewed, or allowed as a project constant. It stores provenance; it does not calculate equilibrium.

## 2. Required record fields
Each record includes: immutable ID/version; status; data type; chemical system identity; numeric value/unit where applicable; KD convention; temperature/value/unit; concentration domain and composition basis; method; complete citation or raw-data location; entered-by/date; reviewer/date; Project Owner approver/date; limitations/notes. A missing system, temperature or domain prevents “Approved default” use.

## 3. Status transition rules
Candidate: source captured, no scientific claim. Reviewed: named reviewer checked that value/convention/unit/system/temperature/domain correspond to intended use. Project Owner Approved: explicit authorization for one defined scope. Rejection/deprecation retains record and reason. Approval creates a new version; old simulation snapshots retain their original reference ID/version.

## 4. Current register (authoritative)
| Item | Status | Permitted system behavior |
|---|---|---|
| Fixed V1 temperature | PENDING | no default temperature |
| Default KD | BLOCKED | accept labelled user KD only |
| KD literature citation/domain | PENDING | no approved prediction claim |
| Equilibrium curve data | PENDING | unavailable to V1/V2 engine |
| Experimental data | PENDING | no fabricated rows |
| Validation threshold/rule | PENDING | metric-only, no PASS/FAIL |

## 5. Review checklist for a proposed KD
Confirm: AcOH–water–ethyl acetate system; definition equals CE/CR; concentrations compatible with mol/L conversion; temperature exactly known; concentration domain reported; method/reference sufficient; candidate does not confuse partition coefficient with a different phase/convention; proposed application range stated. Record uncertainty/limitations; do not average conflicting sources without an approved method.

## 6. UI/API use
Only Approved records appear in “project-approved KD” selector. Candidate/Reviewed records may be displayed in reviewer tools with status but must not auto-populate simulation. User-supplied KD must never create a reference record automatically. Every result saves reference ID/version or source note.
