# PROCESS MODEL — CONSTANT-KD CROSS-CURRENT EXTRACTION

## 1. Stage topology
The process is **cross-current batch extraction**, not counter-current column extraction. The aqueous raffinate is retained between stages. Each stage receives a *new* ethyl acetate portion. Extract from earlier stages is collected and does not re-contact the raffinate.

`Stage 0 feed → [Stage 1: + fresh S1] → E1 + R1 → [Stage 2: R1 + fresh S2] → E2 + R2 → … → EN + RN`

## 2. Components and stream naming

| Symbol | Meaning | Phase / scope |
|---|---|---|
| AcOH | acetic acid, solute of interest | allocated between phases |
| H2O | initial carrier phase | aqueous raffinate nominal phase |
| EtOAc | extraction solvent | organic extract nominal phase |
| Ri | raffinate leaving stage i | aqueous; feed to i+1 |
| Ei | extract leaving stage i | organic; collected |
| nR,i / nE,i | moles AcOH in Ri/Ei | mol |
| CR,i / CE,i | AcOH concentration Ri/Ei | mol/L |

## 3. Input-to-stream mapping
Before any stage, set `VR=feedVolumeL`, `C0=c0MolPerL`, `nR,0=C0×VR`. For a run with N stages, establish exactly N stage solvent volumes. Equal allocation is `VS,i=VS,total/N`. Custom allocation must have N values; stage index is immutable once calculation begins.

At stage i, the engine takes `nIn,i=nR,i−1`, aqueous nominal volume VR and organic nominal volume VS,i. The incoming organic stream has `nAcOH,organic,in=0` by V1 assumption. After equilibrium/separation it returns E_i and R_i. Values from E_i must never be reused as part of `nIn,i+1`.

## 4. Assumptions that affect outputs

| Assumption | Consequence in model | Consequence in UI/claims |
|---|---|---|
| Equilibrium reached at each stage | KD equation may be used directly. | “Equilibrium assumed”, not measured mixing time. |
| KD is constant within run | Same KD in all stages. | Show source/domain warning if unapproved. |
| Negligible volume change | VR and VS,i remain nominal. | Layer heights are illustrative nominal volumes. |
| Fresh solvent | No AcOH enters with solvent. | Stage animation starts organic particles at zero. |
| No loss outside phases | nIn=nR+nE numerically. | Mass-balance warning indicates calculation/rounding issue. |

## 5. Required stage data lifecycle
For each stage compute in this order: validate solvent volume → read prior raffinate amount → calculate equilibrium concentrations → calculate phase amounts → calculate stage/cumulative recovery → calculate residual → freeze result → hand result to visualization. No visual state, timer event or user pause may modify scientific values.

## 6. Edge cases
If C0=0, all stage concentrations/amounts/recoveries are zero; N stages still exist for consistent UI. KD approaching zero is valid only when positive and yields little extraction; KD≤0 is invalid. Zero/negative solvent is invalid even when C0=0, because it violates the chosen process contract. Custom allocations may not use zero-volume “dummy” stages.
