# INPUT SPECIFICATION — BROWSER BOUNDARY CONTRACT

## Canonical request

The form may display mL, but the engine receives only finite canonical SI-like values in L and mol/L. The boundary performs conversion once; no downstream module guesses units.

```ts
type SplitMode = 'equal' | 'custom';
type TemperatureStatus = 'pending' | 'declared';
type KdSourceType = 'user_supplied' | 'project_approved';

interface SimulationInput {
  c0MolPerL: number | string;
  feedVolumeL: number | string;
  totalSolventVolumeL: number | string;
  stageCount: number | string;
  splitMode: SplitMode;
  stageSolventVolumesL: Array<number | string> | null;
  kd: {
    value: number | string;
    sourceType: KdSourceType;
    referenceIdOrNote: string;
    validityDomainNote: string | null;
  };
  temperature: { status: TemperatureStatus; valueC: number | string | null };
  modelId: 'constant-kd-v1';
}
```

Raw form values may be strings because HTML inputs are text. `NormalizedSimulationInput` contains numbers only and is the only input accepted by the pure engine.

## Field contract

| Display label (VI) | Internal field | Symbol | HTML/type | Display/canonical unit | Default/min/max/step | Required and validation |
|---|---|---|---|---|---|---|
| Nồng độ AcOH ban đầu | `c0MolPerL` | `C0` | `input type=number` | mol/L / mol/L | empty / 0 / no scientific max / `any` | Yes; finite and `≥ 0` |
| Thể tích pha nước ban đầu | `feedVolumeL` | `VR` | number | L (mL converter optional) / L | empty / `>0` / no scientific max / `any` | Yes; finite and `> 0` |
| Tổng thể tích etyl axetat | `totalSolventVolumeL` | `VS,total` | number | L (mL converter optional) / L | empty / `>0` / no scientific max / `any` | Yes; finite and `> 0` |
| Hệ số phân bố người dùng cung cấp | `kd.value` | `KD` | number | dimensionless / dimensionless | empty / `>0` / no scientific max / `any` | Yes; finite and `> 0` |
| Số bậc chiết | `stageCount` | `N` | number, integer | count / count | empty / 1 / 10 / 1 | Yes; integer in [1,10] |
| Cách chia dung môi | `splitMode` | — | radio/select | — | none; user must choose | Yes; `equal` or `custom` |
| Dung môi stage i | `stageSolventVolumesL[i]` | `VS,i` | number per row | L (mL converter optional) / L | empty / `>0` / no scientific max / `any` | Required only in custom; exactly N positive values |
| Nguồn KD | `kd.sourceType` | — | select | — | `user_supplied` | Required; approved requires matching reference record |
| Ghi chú/provenance KD | `kd.referenceIdOrNote` | — | text | — | empty until entered | Required non-empty; never auto-created as approved data |
| Miền hiệu lực KD | `kd.validityDomainNote` | — | text | — | null allowed | Null emits warning; never invent domain |
| Trạng thái nhiệt độ | `temperature.status` | — | select | — | `pending` | Required; `pending` or `declared` |
| Nhiệt độ khai báo | `temperature.valueC` | — | number | °C / °C | null for pending / finite for declared | Required iff declared; no V1 default |
| Model | `modelId` | — | hidden/read-only | — | `constant-kd-v1` | Serverless client constant; reject other values |

“No scientific max” means the input cannot be accepted if it overflows JavaScript finite-number range, but V1 does not invent a concentration/volume applicability cap. A future UI may add a technical usability warning without turning it into scientific validity.

## Labels, help and error copy

| Condition | Error code | Vietnamese message | Recovery |
|---|---|---|---|
| Empty/whitespace | `REQUIRED` | `Vui lòng nhập giá trị.` | Focus field |
| Not a finite number | `INVALID_NUMBER` | `Giá trị phải là số hữu hạn.` | Preserve raw text |
| C0 < 0 | `OUT_OF_RANGE` | `C0 phải lớn hơn hoặc bằng 0 mol/L.` | Correct field |
| VR or total solvent ≤ 0 | `OUT_OF_RANGE` | `Thể tích phải lớn hơn 0.` | Correct field |
| N not integer or outside 1–10 | `INVALID_STAGE_COUNT` | `Số bậc phải là số nguyên từ 1 đến 10.` | Correct field |
| KD ≤ 0 | `INVALID_KD` | `KD phải lớn hơn 0.` | Correct field |
| Custom count ≠ N | `SPLIT_COUNT_MISMATCH` | `Cần đúng N giá trị dung môi.` | Add/remove rows |
| Custom volume ≤ 0 | `INVALID_SOLVENT_VOLUME` | `Mỗi thể tích dung môi phải lớn hơn 0.` | Correct row |
| Custom sum outside tolerance | `SPLIT_TOTAL_MISMATCH` | `Tổng chia dung môi phải bằng tổng dung môi trong sai số kỹ thuật cho phép.` | Show running difference |
| Declared without temperature | `TEMPERATURE_VALUE_REQUIRED` | `Cần nhập nhiệt độ khi chọn đã khai báo.` | Correct field |
| Approved KD has no reference | `UNAPPROVED_CONSTANT` | `KD này chưa có reference được Project Owner duyệt.` | Use user-supplied note or approved record |
| Unknown model | `UNSUPPORTED_CONFIGURATION` | `Mô hình V1 không được hỗ trợ.` | Reset model |

Warnings are not errors: user KD shows `User-supplied KD — not a project-approved default`; pending temperature and null domain are visible warnings. A valid run may proceed with these warnings.

## Parsing and normalization

1. Trim text; reject empty before `Number()`.
2. Accept `.` as canonical decimal separator. UI may localize display comma but must normalize it only when unambiguous; a pasted `1,234` is not silently guessed as thousand separator.
3. Accept scientific notation (`1e-3`) because it is a valid finite numeric representation; display a readable formatted value after success.
4. Reject `NaN`, `Infinity`, hexadecimal, units typed into the numeric field and partial strings.
5. Convert visible mL to L exactly once (`L = mL / 1000`) and show conversion in help text.
6. Keep full floating precision; formatting happens in presentation/export only.
7. Copy/paste, arrow keys, wheel changes and locale decimal behavior must be covered by component tests.

## Split behavior and dependencies

`equal` disables custom rows and displays read-only `totalSolventVolumeL / stageCount`. `custom` creates exactly N rows, preserves existing row values by index when N changes, displays sum/difference and blocks Start until valid. Changing N invalidates a prior result and resets custom rows only when their indices cannot be preserved. Changing any field sets UI state `STALE` after a successful run.

## Boundary output

```ts
type ValidationResult =
  | { ok: true; value: NormalizedSimulationInput; warnings: Warning[] }
  | { ok: false; errors: ValidationError[] };
```

The boundary never clamps a scientific value, substitutes a default KD/temperature, or drops an invalid custom row. See `ERROR_HANDLING.md` and `DATA_MODEL.md` for serialized error types.
