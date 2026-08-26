interface Props { isOpen: boolean; title: string; children: React.ReactNode; onSubmit: () => void; onClose: () => void; }
export const FormModal = ({ isOpen, title, children, onSubmit, onClose }: Props) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold">{title}</h3>
          <button onClick={onClose} className="text-gray-500">✕</button>
        </div>
        {children}
        <div className="mt-4 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
          <button onClick={onSubmit} className="px-4 py-2 bg-blue-600 text-white rounded">Save</button>
        </div>
      </div>
    </div>
  );
};
