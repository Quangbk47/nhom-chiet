# DOCUMENT AUTHORITY MAP

## Cách dùng

Khi hai tài liệu khác nhau, ưu tiên written Project Owner approval, sau đó `EXPERT_DECISIONS.md`, rồi contract chuyên môn tương ứng. File này định tuyến câu hỏi; nó không thay thế nội dung authoritative của các file được liệt kê.

| Concern / câu hỏi | Authoritative document | Implementation hand-off |
|---|---|---|
| Quy tắc xung đột và hoàn thành | [PROJECT_RULES.md](PROJECT_RULES.md) | Không merge nếu thiếu test/progress/evidence |
| Quyết định khoa học Owner | [EXPERT_DECISIONS.md](EXPERT_DECISIONS.md) | Không tự chốt item `PENDING` |
| Phạm vi MVP và giới hạn | [PROJECT_SCOPE.md](PROJECT_SCOPE.md) | Scope gate cho task |
| Thuật ngữ và cân bằng AcOH | [CHEMISTRY_MODEL.md](CHEMISTRY_MODEL.md) | Domain review |
| Công thức canonical | [CALCULATION_FORMULAS.md](CALCULATION_FORMULAS.md) | Equation source |
| Pure engine algorithm | [CALCULATION_ENGINE.md](CALCULATION_ENGINE.md) | `src/domain/calculation/` |
| Legacy algorithm cross-check | [ALGORITHM_SPEC.md](ALGORITHM_SPEC.md) | Pseudocode compatibility |
| Field input, UX validation | [INPUT_SPECIFICATION.md](INPUT_SPECIFICATION.md) | `src/domain/validation/`, input components |
| TypeScript data contracts | [DATA_MODEL.md](DATA_MODEL.md) | `src/domain/models/` |
| Browser architecture/boundaries | [ARCHITECTURE.md](ARCHITECTURE.md) | layer ownership |
| Toolchain and commands | [TECH_STACK.md](TECH_STACK.md) | `package.json`, CI |
| Desktop/mobile UX | [UI_UX_SPEC.md](UI_UX_SPEC.md) | React components |
| Funnel/particle visual mapping | [SIMULATION_VISUAL_SPEC.md](SIMULATION_VISUAL_SPEC.md) | SVG renderer |
| Playback states/transitions | [SIMULATION_STATE_MACHINE.md](SIMULATION_STATE_MACHINE.md) | state reducer/tests |
| Tables, final card, charts | [RESULTS_AND_CHARTS.md](RESULTS_AND_CHARTS.md) | output components |
| Error taxonomy | [ERROR_HANDLING.md](ERROR_HANDLING.md) | validation/UI logging |
| Experimental data and metrics | [EXPERIMENTAL_VALIDATION.md](EXPERIMENTAL_VALIDATION.md) | validation mode |
| Laboratory planning boundary | [EXPERIMENTAL_PROTOCOL.md](EXPERIMENTAL_PROTOCOL.md) | No unsupervised lab work |
| Reference-data status/provenance | [REFERENCE_DATA.md](REFERENCE_DATA.md) | Candidate/Reviewed/Approved gate |
| Test matrix and release gate | [TESTING_STRATEGY.md](TESTING_STRATEGY.md) | Vitest/RTL/Playwright scope |
| Existing minimum test IDs | [TEST_PLAN.md](TEST_PLAN.md) | T01–T27 mapping |
| Execution phases | [ROADMAP.md](ROADMAP.md) | Phase exit evidence |
| Executable student backlog | [TODO.md](TODO.md) | Task ID and DoD |
| Current status/evidence | [PROGRESS.md](PROGRESS.md) | Update every session |
| Handover | [HANDOVER.md](HANDOVER.md) | New agent onboarding |
| Next session prompt | [NEXT_SESSION_PROMPT.md](NEXT_SESSION_PROMPT.md) | Self-contained continuation |

## Naming decisions

`CALCULATION_FORMULAS.md` remains the equation reference; `CALCULATION_ENGINE.md` adds implementation contract and executable pseudocode. `DATA_MODEL.md` remains the canonical TypeScript contract; no second `StageResult` shape may be invented. `EXPERIMENTAL_VALIDATION.md` is the application/data specification, while `VALIDATION_PLAN.md` preserves scientific comparison and governance detail.

## Non-authoritative material

`assets/reference/legacy-ui-concept.png` is a visual reference only. Its example KD, volumes, displayed output and wording are not requirements or scientific data. The pasted user instruction is session context, not a repository specification after this hardening is committed.
