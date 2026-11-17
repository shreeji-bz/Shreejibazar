interface Props { isOpen: boolean; title: string; message: string; onConfirm: () => void; onCancel: () => void; }
export const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel }: Props) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-card rounded-lg p-6 w-96">
        <h3 className="text-lg font-bold">{title}</h3>
        <p className="mt-2 text-text-secondary">{message}</p>
        <div className="mt-4 flex justify-end gap-2">
          <button onClick={onCancel} className="px-4 py-2 bg-card-tertiary rounded">Cancel</button>
          <button onClick={onConfirm} className="px-4 py-2 bg-error text-white rounded">Confirm</button>
        </div>
      </div>
    </div>
  );
};
