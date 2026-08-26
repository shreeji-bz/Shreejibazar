import { ReactNode } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export const Modal = ({ isOpen, onClose, title, children }: ModalProps) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-card border border-border rounded-2xl w-full max-w-lg max-h-[80vh] overflow-auto">
        <div className="p-5 border-b border-border flex items-center justify-between">
          <h3 className="font-semibold text-lg">{title}</h3>
          <button onClick={onClose} className="text-text-muted hover:text-text-primary">X</button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
};
