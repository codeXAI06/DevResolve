import DoubtCard from './DoubtCard';
import Spinner from '../ui/Spinner';

export default function DoubtList({ doubts, loading, emptyMessage = 'No doubts found.' }) {
  if (loading) return <Spinner className="py-16" />;
  if (!doubts?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-500">
        <p className="text-lg">{emptyMessage}</p>
      </div>
    );
  }
  return (
    <div className="space-y-5">
      {doubts.map((doubt) => (
        <DoubtCard key={doubt.id} doubt={doubt} />
      ))}
    </div>
  );
}
