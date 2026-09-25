import { readFirebaseConfig } from '../../firebase/config';
import type { PersistenceError } from '../../firebase/adapter';

export type CloudOperationState =
  | { readonly status: 'idle' }
  | { readonly status: 'loading' }
  | { readonly status: 'saved' }
  | { readonly status: 'error'; readonly error: PersistenceError };

export function CloudOperationStatus({ state }: { readonly state: CloudOperationState }) {
  if (state.status === 'idle') return null;
  if (state.status === 'loading')
    return <p role="status">Đang lưu cloud… dữ liệu local vẫn được giữ.</p>;
  if (state.status === 'saved') return <p role="status">Snapshot cloud đã được lưu.</p>;
  return (
    <p className="message message-error" role="alert">
      {state.error.message} Dữ liệu local không bị xóa.
    </p>
  );
}

export function CloudReadinessStatus() {
  const state = readFirebaseConfig();
  return (
    <section className="panel cloud-status" aria-labelledby="cloud-title">
      <div className="panel-heading">
        <p className="step-label">Cloud</p>
        <h2 id="cloud-title">Firebase readiness</h2>
      </div>
      {state.status === 'missing' ? (
        <p role="status">
          Firebase chưa cấu hình; ứng dụng vẫn chạy local. Thiếu: {state.missing.join(', ')}.
        </p>
      ) : state.writesEnabled ? (
        <p className="message message-warning" role="status">
          Firebase config đã có, nhưng Firestore rules trong repository vẫn deny-by-default cho đến
          khi Owner duyệt Authentication/quyền.
        </p>
      ) : (
        <p role="status">Firebase config hợp lệ; cloud write đang tắt. Dữ liệu tiếp tục ở local.</p>
      )}
    </section>
  );
}
