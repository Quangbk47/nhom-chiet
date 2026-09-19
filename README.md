# Liquid–Liquid Extraction Simulator

Teaching + Research Simulator cho chiết lỏng–lỏng nhiều bậc của axit axetic (AcOH) từ nước bằng etyl axetat (EtOAc).

README này là entry point cho sinh viên mới clone repository. Nó mô tả mục tiêu và đường đọc; các contract chi tiết trong `docs/` mới là specification có thẩm quyền.

## 1. Mục đích và bài toán khoa học

Ứng dụng minh họa và kiểm tra bằng dữ liệu thí nghiệm một quy trình **cross-current batch extraction**: pha nước giữ lại giữa các bậc, mỗi bậc nhận một phần EtOAc mới. V1 dùng cân bằng vật chất tại từng equilibrium stage và hệ số phân bố không đổi:

`KD = CE / CR`

Trong đó `CR` và `CE` đều là nồng độ AcOH theo `mol/L`. V1 không phải CFD, không mô phỏng giọt, không mô phỏng động học truyền khối, không suy ra thời gian chiết thực và không thay thế Aspen/HYSYS.

Mục tiêu học tập là làm cho ảnh hưởng của số bậc, tổng dung môi và cách chia dung môi trở nên kiểm chứng được bằng số liệu stage-by-stage. Mục tiêu nghiên cứu là lưu điều kiện, dữ liệu lặp độc lập và so sánh `CR` mô hình với `CR` thực nghiệm mà không che giấu provenance.

## 2. Người dùng và kết quả học tập

- Sinh viên: hiểu raffinate, extract, material balance và lợi ích của nhiều bậc.
- Giảng viên: trình diễn scenario có thể lặp lại, bảng và ba đồ thị.
- Sinh viên nghiên cứu: lưu condition, nhập dữ liệu titration đã chuẩn hóa, xem AE/RE/MAE/RMSE.
- Người duyệt: theo dõi provenance của KD, temperature, threshold và thay đổi dữ liệu.

Sau MVP, người dùng phải biết input nào được nhận, unit canonical là gì, stage result lấy từ đâu, animation chỉ render kết quả nào, và test nào chứng minh invariant.

## 3. MVP gồm gì

- React + TypeScript + Vite chạy trong browser.
- Validation và normalization ở boundary UI/domain.
- Pure deterministic calculation engine, độc lập React và Firebase.
- 1–10 stage, EtOAc mới ở mỗi stage, equal split hoặc custom positive split.
- Stage 0 và stage 1…N trong `SimulationResult` bất biến.
- Funnel/SVG symbolic visualization và state machine; animation time không phải laboratory extraction time.
- Result panel, bảng stage, `CR vs stage`, cumulative recovery và AcOH extracted per stage.
- Single Simulation, Scenario Comparison và Experimental Validation mode.
- Manual entry và CSV import cho raffinate `CR`, tối thiểu 3 independent extraction replicates/condition.
- Lưu Firestore chỉ khi persistence thực sự cần; simulation core phải chạy offline không cần network.

## 4. Ngoài phạm vi V1

Không implement CFD, droplet/interface physics, activity coefficient, ternary tie-line/equilibrium curve, kinetic mixing/settling, phase contraction, density, pH speciation, optimization, automatic KD fitting, PASS/FAIL khi threshold chưa được Owner duyệt, hoặc backend server riêng chỉ để tính công thức.

Nhiệt độ nghiên cứu, default KD, citation/domain KD, equilibrium dataset, experimental dataset và validation acceptance threshold vẫn là `PENDING/BLOCKED`. Không tự điền dữ liệu Internet.

## 5. Kiến trúc và data flow

```text
User input
  -> boundary validation
  -> canonical normalization (L, mol/L)
  -> pure calculation engine
  -> immutable SimulationResult { stages[0..N], final, charts, visualPlan }
  -> simulation state machine
  -> SVG / result cards / table / charts

Browser application ----------------------> optional Firebase services
  React presentation                         Hosting: deployment
  Domain engine                              Firestore: saved studies,
  Visual state machine                       experiments, scenarios (later)
```

React components không tự tính lại `CR`, `CE`, recovery, `KD` hay mass balance. Firebase không đứng giữa UI và engine, không được gọi mỗi animation frame, và không phải source of scientific truth. `docs/ARCHITECTURE.md` và `docs/TECH_STACK.md` chốt boundary triển khai.

## 6. Màn hình chính

Desktop có ba vùng cố định: Input bên trái, Dynamic Simulation ở giữa, Current Result bên phải; phía dưới là timeline, stage table và graphs. Mobile xếp Input → Simulation → Result → Timeline → Table → Graphs. UI phải hiển thị assumption, unit, warning provenance và trạng thái stale sau khi input đổi. Chi tiết layout, keyboard, token và SVG ở [UI_UX_SPEC.md](docs/UI_UX_SPEC.md), [SIMULATION_VISUAL_SPEC.md](docs/SIMULATION_VISUAL_SPEC.md), [SIMULATION_STATE_MACHINE.md](docs/SIMULATION_STATE_MACHINE.md).

## 7. Input và quy trình tính

Input canonical gồm `c0MolPerL`, `feedVolumeL`, `totalSolventVolumeL`, `stageCount`, `splitMode`, tùy chọn `stageSolventVolumesL`, `kd`, `temperature`, `modelId`. UI có thể cho nhập mL nhưng phải chuyển L đúng một lần trước engine. Công thức, pseudocode, error và invariant ở [INPUT_SPECIFICATION.md](docs/INPUT_SPECIFICATION.md) và [CALCULATION_ENGINE.md](docs/CALCULATION_ENGINE.md).

Mỗi stage lấy raffinate stage trước và solvent mới, tính `CR`, `CE`, `nR`, `nE`, cumulative recovery và mass-balance diagnostic. Extract stage trước không quay lại stage sau.

## 8. Output

`SimulationResult` là snapshot khoa học duy nhất: engine version, canonical input, provenance, warnings, `stages[0..N]`, `final`, chart datasets và visual plan. Output contract và graph/table mapping ở [DATA_MODEL.md](docs/DATA_MODEL.md), [RESULTS_AND_CHARTS.md](docs/RESULTS_AND_CHARTS.md). Validation analytics ở [EXPERIMENTAL_VALIDATION.md](docs/EXPERIMENTAL_VALIDATION.md).

## 9. Firebase

Firebase Hosting là deployment target. Firestore là tùy chọn cho saved scenarios, experimental datasets và metadata/audit; không bắt buộc cho calculation MVP. Không thêm Firebase Auth chỉ để làm kiến trúc đẹp khi chưa có yêu cầu người dùng/permission. Chi tiết và migration gate ở [ARCHITECTURE.md](docs/ARCHITECTURE.md).

## 10. Bản đồ tài liệu

Đọc [DOCUMENT_AUTHORITY_MAP.md](docs/DOCUMENT_AUTHORITY_MAP.md) để biết mỗi câu hỏi thuộc file nào. Quy tắc khoa học bắt buộc ở [EXPERT_DECISIONS.md](docs/EXPERT_DECISIONS.md) và [PROJECT_RULES.md](docs/PROJECT_RULES.md); tình trạng thật ở [PROGRESS.md](docs/PROGRESS.md); backlog có thể giao ở [TODO.md](docs/TODO.md).

## 11. Workflow cho sinh viên

1. Đọc README → authority map → expert decisions → scope/model/input/engine.
2. Chọn task `NOT STARTED` đầu tiên trong `TODO.md`, kiểm tra dependency và files expected.
3. Viết test contract trước hoặc cùng implementation; không đưa chemistry vào React.
4. Chạy lint/typecheck/test/coverage theo `TECH_STACK.md` và `TESTING_STRATEGY.md`.
5. Cập nhật specification/progress/evidence, review `git diff --check`, commit message có phạm vi.
6. Không tự biến Candidate/Reviewed datum thành default; không sửa raw experiment để làm đẹp metric.

## 12. Trạng thái hiện tại và task kế tiếp

Documentation hardening đang hoàn thành trong phiên này; application code chưa tồn tại. Scientific readiness vẫn bị block bởi các quyết định Owner B01–B04. Task kỹ thuật kế tiếp là `ENG-001`: scaffold Vite React TypeScript và chốt toolchain theo [TECH_STACK.md](docs/TECH_STACK.md), tạo setup/test tối thiểu nhưng chưa implement chemistry.

## 13. Khởi động khi source được scaffold

Toolchain target là Node 22 LTS, pnpm và Vite; command chính sẽ được ghi trong `package.json`/`TECH_STACK.md` khi `ENG-001` hoàn thành:

```text
pnpm install
pnpm dev
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Hiện các command trên chưa chạy được vì repository chưa có `package.json`; đó là trạng thái có chủ ý, không phải lỗi tài liệu.

## 14. Giới hạn khoa học cần luôn hiển thị

Constant KD là giả thiết trong context đã khai báo, không phải universal equilibrium claim. User-supplied KD phải hiện warning và provenance; temperature pending phải hiện rõ; animation là visualization; mass-balance numerical tolerance không phải validation acceptance threshold.
