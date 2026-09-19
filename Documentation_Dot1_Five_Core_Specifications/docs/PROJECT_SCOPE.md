# PROJECT SCOPE — V1

## 1. Product definition
**Liquid–Liquid Extraction Simulator** is a web application for teaching and research support. V1 models the *equilibrium material balance* of cross-current, batch extraction of acetic acid (AcOH) from water using fresh ethyl acetate in each extraction stage.

The core product chain is mandatory:

`validated input → backend calculation → immutable stage-result snapshot → frontend animation/table/graphs → optional experimental comparison`.

The web page is therefore not an illustrative video. A user changing solvent allocation, KD, feed concentration, or stage count must obtain a newly calculated stage sequence; all numerical labels, particles, charts, and final values must be derived from that sequence.

## 2. Intended users and use cases

| User | Primary goal | System outcome |
|---|---|---|
| Student | Learn how multistage extraction changes raffinate/extract amount. | Visible stage-by-stage material balance with assumptions shown. |
| Instructor | Demonstrate effect of KD, solvent volume, and stage allocation. | Reproducible scenario and graphs. |
| Student researcher | Compare a defined constant-KD prediction with measurements. | Saved conditions, raw replicate inputs, errors and audit trail. |
| Project Owner/reviewer | Control scientific assumptions and data approval. | Provenance/status, not silently changed constants. |

## 3. V1 functional scope

### 3.1 Inputs
V1 accepts only canonical calculation inputs:

| Field | Symbol | Canonical unit | Rule |
|---|---:|---|---|
| Initial AcOH concentration | C0 | mol/L | finite, ≥0 |
| Aqueous feed volume | VR | L | finite, >0 |
| Total ethyl acetate volume | VS,total | L | finite, >0 |
| Stage count | N | integer | 1–10 inclusive |
| Distribution coefficient | KD | dimensionless | finite, >0 |
| Solvent allocation | VS,i | L | equal or N custom positive values |

The UI may accept mL only through a visible converter, but API/engine input is L. The UI may not submit unit-free numbers.

### 3.2 Required V1 capabilities
1. One calculation run with equal/custom fresh-solvent split.
2. Complete result for stage 0 and stages 1…N.
3. Mass-balance residual and relative numerical error for every stage and final result.
4. Calculation-driven funnel visual playback and controls.
5. Table and three graphs: `CR vs stage`, `cumulative recovery vs stage`, `AcOH extracted at each stage`.
6. Named scenario comparison.
7. Manual entry and CSV import of experimental raffinate concentration.
8. Replicate mean, sample standard deviation, absolute/relative error, MAE and RMSE.
9. Database persistence of research records while keeping calculation engine independent.

## 4. Explicit scientific model boundary
V1 assumes: each stage reaches equilibrium; KD is constant within the one declared run; fresh organic solvent initially contains no AcOH; nominal aqueous and organic phase volumes do not change appreciably. It does **not** calculate mutual solubility, phase contraction, solvent loss, density, interface position from physical properties, chemical association, pH speciation, kinetic transfer, mixing rate, droplet sizes, emulsion formation, settling time, CFD, or complete ternary liquid–liquid equilibrium.

The output is valid only as a calculation under this model and the declared KD context. It is not a claim that the physical system will be predicted accurately outside a Project Owner-approved temperature/concentration range.

## 5. Out of scope and deferred work

| Item | Status | Reason |
|---|---|---|
| `CE=f(CR)` equilibrium curve | V2 | Requires approved data and nonlinear solver contract. |
| Automatic KD fitting | Deferred | Would create circular “validation”; must be controlled research work. |
| Process optimization/recommended N | V3 consideration | Needs objective, constraints, approved model/data. |
| Actual extraction timing | Excluded | No kinetics model. |
| Aspen/HYSYS or CFD equivalence | Excluded | Not product purpose. |

## 6. Scientific constants that must not be invented
Fixed V1 temperature, default KD, KD citation, KD validity domain, equilibrium data, experimental data and validation PASS/FAIL threshold are PENDING/BLOCKED. Until approval, the user may supply KD but the application must persist and display `user_supplied`, never label it as an approved project default.

## 7. Done criteria for V1 scope
V1 scope is not complete because a screen exists. It is complete only when the required calculation/API/UI/data/validation features have passing evidence in `TEST_PLAN.md`, the limitations above are visible in product UI, and `PROGRESS.md` is updated under the mandatory workflow.
