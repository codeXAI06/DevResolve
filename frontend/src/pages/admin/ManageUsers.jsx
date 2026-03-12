import { useEffect, useState } from 'react';
import { adminApi } from '../../api/admin';
import PageLayout from '../../components/layout/PageLayout';
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Spinner from '../../components/ui/Spinner';
import Pagination from '../../components/common/Pagination';
import { Shield, Ban } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, [page]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const { data } = await adminApi.getUsers(page, 20);
      setUsers(data.content || []);
      setTotalPages(data.totalPages || 0);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handleBan = async (userId) => {
    try {
      await adminApi.banUser(userId);
      toast.success('User banned');
      loadUsers();
    } catch {
      toast.error('Failed to ban user');
    }
  };

  const handleUnban = async (userId) => {
    try {
      await adminApi.unbanUser(userId);
      toast.success('User unbanned');
      loadUsers();
    } catch {
      toast.error('Failed to unban user');
    }
  };

  return (
    <PageLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Shield className="h-7 w-7 text-indigo-400" /> Manage Users
        </h1>
      </div>

      {loading ? (
        <Spinner className="py-16" />
      ) : (
        <div className="space-y-3">
          {users.map((u) => (
            <Card key={u.id}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3.5">
                  <Avatar username={u.username} size="sm" />
                  <div>
                    <div className="flex items-center gap-2.5">
                      <span className="text-base font-medium text-white">{u.username}</span>
                      <Badge color={u.role === 'ADMIN' ? 'purple' : 'gray'} size="sm">{u.role}</Badge>
                      {u.banned && <Badge color="red" size="sm">Banned</Badge>}
                    </div>
                    <p className="text-sm text-gray-500">{u.email} — {u.reputationPoints} pts</p>
                  </div>
                </div>
                <div>
                  {u.banned ? (
                    <Button variant="outline" size="sm" onClick={() => handleUnban(u.id)}>Unban</Button>
                  ) : u.role !== 'ADMIN' ? (
                    <Button variant="danger" size="sm" onClick={() => handleBan(u.id)} icon={<Ban className="h-3 w-3" />}>
                      Ban
                    </Button>
                  ) : null}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </PageLayout>
  );
}
