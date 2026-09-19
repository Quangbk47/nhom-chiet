# ERROR HANDLING CONTRACT

Errors are typed data, not thrown strings. A recoverable validation error preserves raw input; a calculation fault prevents animation; a persistence error never changes an already valid local result.

## Taxonomy

| Category | Codes/examples | Severity | User message pattern | Recoverable | UI location |
|---|---|---|---|---|---|
| `INPUT_VALIDATION_ERROR` | `REQUIRED`, `INVALID_NUMBER`, `OUT_OF_RANGE`, `INVALID_STAGE_COUNT` | error | Vietnamese field/range explanation | yes | field + summary |
| `CALCULATION_ERROR` | `INVALID_KD`, `SPLIT_TOTAL_MISMATCH`, `UNSUPPORTED_CONFIGURATION` | error | sửa input/provenance | yes | form/result banner |
| `NUMERIC_ERROR` | non-finite denominator/intermediate, failed invariant | fault | `Không thể tạo kết quả tính toán; ghi mã chẩn đoán.` | retry after report | result/error banner |
| `MASS_BALANCE_WARNING` | residual within named engineering tolerance | warning | `Sai số số học được ghi nhận; không phải validation PASS/FAIL.` | yes | stage/final diagnostic |
| `UI_ERROR` | render/state-machine contract failure | fault | `Giao diện không thể trình bày snapshot này.` | reset/reload | error boundary |
| `FIREBASE_ERROR` | read/write/permission/offline | warning/error by action | `Không lưu/tải được; kết quả cục bộ vẫn được giữ.` | retry/offline | persistence toast/panel |

## Error shape

```ts
interface DomainError {
  category: 'INPUT_VALIDATION_ERROR' | 'CALCULATION_ERROR' | 'NUMERIC_ERROR';
  code: string; field?: string; stageNumber?: number;
  message: string; details?: Record<string, unknown>;
}
interface PersistenceError {
  category: 'FIREBASE_ERROR'; code: string; message: string;
  operation: 'save' | 'load' | 'import'; retryable: boolean;
}
```

Do not include secrets, raw credentials or personal data in details. Developer diagnostics may include stage index and finite numeric values, but not a fabricated scientific explanation.

## Recovery rules

1. Parse/validation errors focus the first field, show all known field errors and keep user text.
2. Invalid provenance blocks only the affected calculation; it does not silently downgrade an approved request to user KD.
3. Numeric fault discards the partial result and leaves no stage available to animation.
4. Warning keeps result valid and is stored in `SimulationResult.warnings`.
5. Input edits transition a displayed result to `stale`; an old result is never labelled current.
6. Firebase offline/write failure preserves local snapshot and offers retry; raw rows are not silently skipped.

## Logging/test rules

Pure engine tests assert returned errors, not console output. UI may log a stable error code and app version; production logs must redact raw experiment values unless the user opted into research audit. Every new error code requires a row in this file, an error-copy test and a recovery/acceptance case.
