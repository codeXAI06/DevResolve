import { useEffect, useState } from 'react';
import { adminApi } from '../../api/admin';
import PageLayout from '../../components/layout/PageLayout';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Spinner from '../../components/ui/Spinner';
import Pagination from '../../components/common/Pagination';
import { MessageCircle, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ManageDoubts() {
  const [doubts, setDoubts] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDoubts();
  }, [page]);

  const loadDoubts = async () => {
    setLoading(true);
    try {
      const { data } = await adminApi.getDoubts(page, 20);
      setDoubts(data.content || []);
      setTotalPages(data.totalPages || 0);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (doubtId) => {
    if (!confirm('Delete this doubt permanently?')) return;
    try {
      await adminApi.deleteDoubt(doubtId);
      toast.success('Doubt deleted');
      loadDoubts();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const statusColors = { OPEN: 'green', ANSWERED: 'blue', CLOSED: 'gray' };

  return (
    <PageLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <MessageCircle className="h-7 w-7 text-indigo-400" /> Manage Doubts
        </h1>
      </div>

      {loading ? (
        <Spinner className="py-16" />
      ) : (
        <div className="space-y-3">
          {doubts.map((d) => (
            <Card key={d.id}>
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0 mr-4">
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <Badge color={statusColors[d.status]} size="sm">{d.status}</Badge>
                    <span className="text-sm text-gray-500">by {d.author?.username}</span>
                  </div>
                  <h3 className="text-base font-medium text-white truncate">{d.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">{d.answerCount || 0} answers — {d.viewCount || 0} views</p>
                </div>
                <Button variant="danger" size="sm" onClick={() => handleDelete(d.id)} icon={<Trash2 className="h-3 w-3" />}>
                  Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </PageLayout>
  );
}
