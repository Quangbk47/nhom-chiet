# CALCULATION FORMULAS — V1

## 1. Canonical notation and units

| Symbol | Definition | Unit |
|---|---|---|
| C0 | initial aqueous AcOH concentration | mol/L |
| VR | nominal aqueous/feed volume | L |
| VS,i | fresh organic solvent volume at stage i | L |
| n0 | initial AcOH amount | mol |
| nIn,i | AcOH amount entering stage i | mol |
| CR,i / CE,i | final aqueous/organic AcOH concentration stage i | mol/L |
| nR,i / nE,i | final raffinate/extract AcOH amount stage i | mol |
| KD | distribution coefficient CE/CR | dimensionless |

Convert all input mL to L exactly once before formula evaluation. Carry at least implementation floating-point precision through calculation; apply decimal formatting solely at response/UI/export presentation.

## 2. Initial condition

`n0 = C0 × VR`

`nR,0=n0`; `CR,0=C0`; `nE,0=0`; cumulative extracted amount at stage 0 is 0; cumulative recovery at stage 0 is 0%.

## 3. One-stage derivation
At stage i the incoming AcOH is entirely in incoming raffinate, so:

`nIn,i = nR,i−1`

At equilibrium, Decision 02 fixes:

`KD = CE,i / CR,i`

The V1 stage material balance is:

`nIn,i = CR,i × VR + CE,i × VS,i`

Substituting `CE,i=KD×CR,i`:

`CR,i = nIn,i / (VR + KD × VS,i)`

Then calculate without using rounded CR:

`CE,i = KD × CR,i`

`nR,i = CR,i × VR`

`nE,i = CE,i × VS,i`

The retained fraction (for diagnostic/closed form) is:

`q_i = VR / (VR + KD × VS,i)`

Thus `nR,i=nIn,i×q_i`.

## 4. Multistage calculations

`nR,N = n0 × ∏(i=1…N) q_i`

`nExtracted,cumulative,i = n0 − nR,i`

If n0>0:

`Recovery,cumulative,i (%) = 100 × (n0 − nR,i) / n0`

If nIn,i>0:

`Recovery,stage,i (%) = 100 × nE,i / nIn,i`

When denominator is zero, report recovery as 0% for this zero-solute stage, not NaN/Infinity. The API must preserve that this is a defined edge-case convention.

For equal split, `VS,i=VS,total/N`; because all q are equal, `nR,N=n0×q^N`. This closed form is a test oracle only; the engine must still generate each stage sequentially for outputs.

## 5. Mass-balance diagnostic
Per stage:

`residual_i = nIn,i − (nR,i+nE,i)`

For nIn,i≠0:

`MB_error_i(%) = 100 × |residual_i| / |nIn,i|`

For nIn,i=0, residual must equal zero; return 0% only in that case. A nonzero residual is an engine defect/warning. This diagnostic checks numerical preservation under the model; it is not an experimental validation threshold.

## 6. Required properties for implementation tests
For all valid positive-KD inputs: CR, CE, nR and nE are nonnegative; `nR+nE≈nIn`; `CE/CR≈KD` when CR>0; nR never increases across stages; cumulative recovery stays [0,100] and never decreases; total solvent is unchanged by split mode. Use a named floating-point `numericTolerance` in test/configuration and return/record it separately from Project Owner validation threshold.
