import Modal from './Modal';

export default function ConfirmDialog({ title, message, confirmLabel = 'Delete', busy = false, onConfirm, onCancel }) {
  return (
    <Modal title={title} onClose={busy ? () => {} : onCancel}>
      <p className="text-secondary">{message}</p>
      <div className="modal-actions">
        <button className="btn btn-secondary" onClick={onCancel} disabled={busy}>Cancel</button>
        <button className="btn btn-danger" onClick={onConfirm} disabled={busy}>
          {busy && <span className="spinner" aria-hidden="true" />} {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
