# CHEMISTRY MODEL — V1 CONSTANT-KD CROSS-CURRENT EXTRACTION

## Purpose and boundary

This is the scientific glossary and derivation that a domain-engine developer must understand before coding. It describes a nominal two-phase material balance, not a claim that the real ternary system obeys the simplification at every temperature or concentration.

## Terms

| Term | V1 meaning |
|---|---|
| AcOH / solute | Acetic acid whose amount is tracked; it is distributed between phases. |
| Water / carrier phase | Initial aqueous phase retained as raffinate between stages. Its nominal volume is `VR`. |
| EtOAc / extraction solvent | Fresh nominal organic phase added at each stage. Its stage volume is `VS,i`. |
| Raffinate (`R_i`) | Aqueous phase leaving stage `i`, returned as feed to stage `i+1`. |
| Extract (`E_i`) | Organic phase leaving stage `i`, collected and never returned in V1. |
| Equilibrium stage | One contact/separation calculation assuming equilibrium is reached. |
| Distribution coefficient (`KD`) | Constant dimensionless ratio `CE / CR` for the declared run/context. |
| `CR` | Equilibrium AcOH concentration in nominal aqueous raffinate, `mol/L`. |
| `CE` | Equilibrium AcOH concentration in nominal EtOAc extract, `mol/L`. |

The phrase “phase color” in the UI is conventional. It is not a measured optical property or proof of composition.

## Stage topology

```text
R0 (feed) + fresh S1 -> R1 + E1
R1       + fresh S2 -> R2 + E2
...
R(N-1)   + fresh SN -> RN + EN
```

The aqueous volume remains nominally `VR`; the organic volume in stage `i` is `VS,i`. Extract from an earlier stage is removed. Fresh solvent contains zero incoming AcOH in the V1 model.

## Constant-KD convention and units

```text
KD = CE / CR
```

Both concentrations use `mol/L`, so the ratio is dimensionless. A partition coefficient reported in another convention, another concentration basis, or without temperature/domain cannot be silently reused as V1 KD. A user input is a model parameter with provenance, not experimental proof.

## Assumptions

1. Equilibrium is reached at each stage.
2. KD is constant within one run.
3. The organic solvent starts with no AcOH.
4. Phase volumes do not contract, swell, dissolve into each other, or lose solvent materially.
5. No AcOH is lost outside the two nominal phases.
6. All stage solvent portions are positive and known.
7. `VR` is carried unchanged between stages.

The UI must say “equilibrium assumed” and “nominal volumes”. It must never label animation duration as contact/settling time.

## One-stage derivation

Let `nIn,i` be AcOH moles entering stage `i` in the aqueous feed. At equilibrium:

```text
nIn,i = Cin,i * VR = CR,i * VR + CE,i * VS,i
CE,i  = KD * CR,i

CR,i = nIn,i / (VR + KD * VS,i)
CE,i = KD * CR,i
nR,i = CR,i * VR
nE,i = CE,i * VS,i
```

The retained fraction and extracted fraction for that stage are:

```text
q_i                 = VR / (VR + KD * VS,i)
fractionRemaining_i = nR,i / nIn,i = q_i       (when nIn,i > 0)
fractionExtracted_i = nE,i / nIn,i = 1 - q_i  (when nIn,i > 0)
```

If `nIn,i = 0`, both fractions are defined as zero for reporting, not `NaN` or infinity. The denominator is strictly positive for valid `VR > 0`, `KD > 0`, `VS,i > 0`.

## Multistage quantities

```text
n0 = C0 * VR
nIn,1 = n0
nIn,i = nR,i-1 for i > 1
nR,N = n0 * product(q_i, i=1..N)
nExtractedCumulative,i = n0 - nR,i
recoveryCumulative,i   = 100 * (n0 - nR,i) / n0 when n0 > 0
```

When `n0 = 0`, every amount/concentration/recovery report is zero and all N stage records still exist. Per-stage recovery is also zero when its incoming amount is zero.

## Model limitations

Constant KD does not encode a `KD(CR)` curve, activity coefficients, association, pH speciation, ternary tie-lines, mutual solubility, density, droplet size, mass-transfer rate, mixing quality or real settling. Values outside a reviewed/approved provenance domain are exploratory only. V2 may add a curve only with a new approved data/solver contract.

## Implementation link

`CALCULATION_FORMULAS.md` is the compact equation reference. `CALCULATION_ENGINE.md` turns these equations into TypeScript-oriented pure functions and invariants. `DATA_MODEL.md` names the serialized fields. Do not derive a second convention in UI or charts.
