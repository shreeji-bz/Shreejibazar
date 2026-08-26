interface Props { isOpen: boolean; title: string; message: string; onConfirm: () => void; onCancel: () => void; }
export const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel }: Props) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-96">
        <h3 className="text-lg font-bold">{title}</h3>
        <p className="mt-2 text-gray-600">{message}</p>
        <div className="mt-4 flex justify-end gap-2">
          <button onClick={onCancel} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
          <button onClick={onConfirm} className="px-4 py-2 bg-red-600 text-white rounded">Confirm</button>
        </div>
      </div>
    </div>
  );
};
