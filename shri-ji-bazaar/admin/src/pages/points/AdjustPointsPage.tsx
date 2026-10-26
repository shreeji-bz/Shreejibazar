interface AdjustPointsPageProps {
  userId: string;
  onClose: () => void;
}

export const AdjustPointsPage = ({ userId, onClose }: AdjustPointsPageProps) => (
  <div className="p-6">
    <div className="flex items-center justify-between mb-4">
      <h1 className="text-2xl font-bold text-gray-900">Adjust Points — {userId}</h1>
      <button onClick={onClose} className="text-gray-400 hover:text-gray-600">Close</button>
    </div>
  </div>
);
