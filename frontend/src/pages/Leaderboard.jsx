import { useEffect, useState } from 'react';
import { usersApi } from '../api/misc';
import PageLayout from '../components/layout/PageLayout';
import Avatar from '../components/ui/Avatar';
import Card from '../components/ui/Card';
import Spinner from '../components/ui/Spinner';
import Pagination from '../components/common/Pagination';
import { Trophy, Medal } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Leaderboard() {
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { data } = await usersApi.getTop(page, 20);
        setUsers(data.content || []);
        setTotalPages(data.totalPages || 0);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [page]);

  const rankColors = ['text-yellow-400', 'text-gray-300', 'text-amber-600'];

  return (
    <PageLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Trophy className="h-7 w-7 text-yellow-400" /> Leaderboard
        </h1>
        <p className="text-gray-400 text-base mt-2">Top contributors by reputation</p>
      </div>

      {loading ? (
        <Spinner className="py-16" />
      ) : users.length === 0 ? (
        <p className="text-center text-gray-500 py-16">No users yet.</p>
      ) : (
        <div className="space-y-3">
          {users.map((u, i) => {
            const rank = page * 20 + i + 1;
            return (
              <Card key={u.id} hover>
                <Link to={`/profile/${u.username}`} className="flex items-center gap-5">
                  <div className={`w-10 text-center font-bold text-xl ${rankColors[rank - 1] || 'text-gray-500'}`}>
                    {rank <= 3 ? <Medal className="h-6 w-6 mx-auto" /> : `#${rank}`}
                  </div>
                  <Avatar username={u.username} size="md" />
                  <div className="flex-1">
                    <span className="text-base font-medium text-gray-200">{u.username}</span>
                  </div>
                  <span className="text-base font-semibold text-indigo-400">{u.reputationPoints} pts</span>
                </Link>
              </Card>
            );
          })}
        </div>
      )}
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </PageLayout>
  );
}
