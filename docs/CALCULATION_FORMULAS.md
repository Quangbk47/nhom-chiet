# CALCULATION FORMULAS — V1 CANONICAL EQUATIONS

## Notation and units

| Symbol | Meaning | Unit |
|---|---|---|
| `C0` | initial aqueous AcOH concentration | mol/L |
| `VR` | nominal aqueous/feed volume | L |
| `VS,i` | fresh EtOAc volume at stage i | L |
| `n0` | initial AcOH amount | mol |
| `nIn,i` | AcOH amount entering stage i | mol |
| `CR,i` / `CE,i` | final aqueous/organic AcOH concentration | mol/L |
| `nR,i` / `nE,i` | final raffinate/extract AcOH amount | mol |
| `KD` | `CE/CR`, constant for the run | dimensionless |

Convert displayed mL to L exactly once at the browser boundary. Carry full floating-point precision through calculation; round only in presentation/export.

## Initial state

```text
n0 = C0 * VR
nR,0 = n0
CR,0 = C0
CE,0 = 0
nE,0 = 0
cumulativeExtracted,0 = 0
cumulativeRecovery,0 = 0%
```

## One-stage derivation

Incoming AcOH is entirely in the retained aqueous feed:

```text
nIn,i = nR,i-1
nIn,i = CR,i*VR + CE,i*VS,i
KD = CE,i/CR,i
CE,i = KD*CR,i

CR,i = nIn,i / (VR + KD*VS,i)
CE,i = KD*CR,i
nR,i = CR,i*VR
nE,i = CE,i*VS,i
```

Retained and extracted fractions:

```text
q_i = VR/(VR + KD*VS,i)
fractionRemaining_i = q_i
fractionExtracted_i = 1-q_i
```

Use the fraction definitions as zero when `nIn,i=0` for reporting; never return NaN/Infinity.

## Multistage

```text
nR,N = n0 * product(q_i for i=1..N)
cumulativeExtracted_i = n0 - nR,i
cumulativeRecovery_i = n0==0 ? 0 : 100*cumulativeExtracted_i/n0
stageRecovery_i = nIn,i==0 ? 0 : 100*nE,i/nIn,i
```

Equal split sets `VS,i=VS,total/N` for every i. The engine still loops sequentially; the product is a test oracle only. Custom split preserves its ordered list after the input sum tolerance check.

## Mass balance

```text
residual_i = nIn,i - (nR,i+nE,i)
absoluteError_i = abs(residual_i)
relativeErrorPercent_i = nIn,i==0 ? 0 : 100*absoluteError_i/abs(nIn,i)
```

This is a numerical conservation diagnostic. The named engine `numericTolerance` is not the Owner's experimental validation threshold. Any non-finite or out-of-tolerance invariant is a calculation fault, not a reason to clamp values.

## Required properties

For valid positive KD inputs: all concentrations/amounts are nonnegative; `nR+nE` equals incoming within engineering tolerance; `CE/CR≈KD` when CR>0; nR and cumulative recovery are monotonic in the expected direction; total solvent is unchanged by split mode. See `CHEMISTRY_MODEL.md` and `CALCULATION_ENGINE.md` for derivation and executable contract.
