# PROCESS MODEL — CROSS-CURRENT BATCH EXTRACTION

## Topology

V1 is not counter-current column extraction. The aqueous raffinate remains available as the next feed; each stage receives fresh EtOAc and produces a collected extract:

```text
R0 -> [S1] -> R1 + E1
R1 -> [S2] -> R2 + E2
...
R(N-1) -> [SN] -> RN + EN
```

`E1…E(N-1)` never re-contact the retained raffinate. The pure engine implements this topology sequentially before any visual playback.

## Stream vocabulary

| Symbol | Meaning | Nominal phase |
|---|---|---|
| AcOH | tracked solute | split between phases |
| H2O | carrier | aqueous raffinate |
| EtOAc | fresh solvent | organic extract |
| `Ri` | raffinate leaving i | aqueous, feeds i+1 |
| `Ei` | extract leaving i | organic, collected |
| `nR,i/nE,i` | AcOH moles in phases | mol |
| `CR,i/CE,i` | AcOH concentration | mol/L |

## Mapping to input/result

Before stage 1, `VR=feedVolumeL`, `C0=c0MolPerL`, `nR,0=C0*VR`. Equal allocation creates N equal positive volumes; custom allocation must contain N positive values and retain stage order. For stage i, `nIn,i=nR,i-1`, `VS=stageSolventVolumesL[i-1]`, and incoming organic AcOH is zero.

## Assumption consequences

| Assumption | Calculation | UI/claim |
|---|---|---|
| equilibrium reached | use constant-KD algebra | “equilibrium assumed”, not mixing time |
| KD constant | same value every stage | show source/domain warning |
| nominal volumes | `VR`, `VS,i` unchanged | heights illustrative |
| fresh solvent | organic input AcOH zero | start organic particles at zero |
| no outside loss | `nIn≈nR+nE` | mass-balance diagnostic |

## Stage lifecycle

Validation → read prior raffinate amount → calculate CR/CE/phase amounts → calculate stage/cumulative recovery → calculate mass balance → freeze StageResult → hand it to visualization. No state/timer/pause can modify a scientific field.

## Edge cases

`C0=0` keeps N stage records and all numerical values zero. Positive KD may be arbitrarily small but never zero/negative. Every stage needs positive solvent, including zero-solute runs; custom zero-volume dummy stages are invalid.
