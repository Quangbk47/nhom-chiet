# REFERENCE DATA AND SCIENTIFIC PROVENANCE

## Purpose

This register decides whether a datum is found, technically reviewed or approved for project use. It never calculates equilibrium and it never creates a default merely because a row exists.

## Required record

Each immutable version contains: ID/version; status; data type; AcOH–water–EtOAc system identity; numeric value/unit; KD convention (`CE/CR`); temperature value/unit/status; concentration domain and composition basis; method; complete citation or raw-data pointer; entered-by/date; reviewer/date; Owner approver/date; uncertainty/limitations; permitted application range.

Missing system, convention, temperature or domain blocks Approved-default use. A record is never edited in place after an old simulation references it.

## Status lifecycle

```text
Candidate -> Reviewed -> Project Owner Approved
     \-> Rejected/Deprecated (record retained with reason)
```

Candidate means captured but unverified. Reviewed means a named reviewer checked identity, units, convention, source, temperature and domain. Approved means explicit Owner authorization for one scope/version. A status change creates a new version; old snapshots retain their original record.

## Current authoritative register

| Item | Status | Application behavior |
|---|---|---|
| Fixed V1 temperature | PENDING | store `pending` or declared user metadata; no default |
| Default KD | BLOCKED | accept labelled user KD only |
| KD citation/domain | PENDING | no approved prediction claim |
| Equilibrium curve | PENDING | unavailable to V1 |
| Experimental dataset | PENDING | no fabricated rows |
| Validation threshold/rule | PENDING | metrics only; no PASS/FAIL |

## KD review checklist

Confirm system identity, `CE/CR` convention, concentration basis, exact temperature, domain, method, source/raw data, uncertainty and proposed application range. Do not confuse partition coefficient conventions or average conflicting sources without an approved method.

## Client use

Only Approved records may populate a project-approved selector. Candidate/Reviewed records may be shown to reviewers but never auto-populate a run. A user-supplied KD stores its note in result provenance and raises `USER_SUPPLIED_KD`; it never creates a reference record automatically. The pure engine can run with the user input offline.
