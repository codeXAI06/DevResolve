import { useEffect, useState } from 'react';
import { adminApi } from '../../api/admin';
import PageLayout from '../../components/layout/PageLayout';
import Card from '../../components/ui/Card';
import Spinner from '../../components/ui/Spinner';
import { Users, MessageCircle, CheckCircle2, Clock, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await adminApi.getAnalytics();
        setAnalytics(data);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <PageLayout><Spinner className="py-20" /></PageLayout>;
  if (!analytics) return <PageLayout><p className="text-gray-400 text-center py-20">Failed to load analytics.</p></PageLayout>;

  const stats = [
    { label: 'Total Users', value: analytics.totalUsers, icon: Users, color: 'text-blue-400' },
    { label: 'Total Doubts', value: analytics.totalDoubts, icon: MessageCircle, color: 'text-green-400' },
    { label: 'Total Answers', value: analytics.totalAnswers, icon: CheckCircle2, color: 'text-indigo-400' },
    { label: 'New Today', value: analytics.newUsersToday ?? 0, icon: TrendingUp, color: 'text-yellow-400' },
  ];

  const COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];
  const tagChartData = (analytics.topTags || []).map((t) => ({ name: t.tagName || t.name, value: t.count || t.usageCount || 0 }));

  return (
    <PageLayout>
      <div className="animate-fade-in">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
          <div className="flex gap-3">
            <Link to="/admin/users" className="text-base text-indigo-400 hover:text-indigo-300">Manage Users</Link>
            <span className="text-gray-600">|</span>
            <Link to="/admin/doubts" className="text-sm text-indigo-400 hover:text-indigo-300">Manage Doubts</Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          {stats.map(({ label, value, icon: Icon, color }) => (
            <Card key={label}>
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl bg-gray-800 ${color}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{value}</p>
                  <p className="text-sm text-gray-500">{label}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {tagChartData.length > 0 && (
            <Card>
              <h2 className="text-xl font-semibold text-white mb-5">Top Tags</h2>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={tagChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#f1f5f9' }} />
                  <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          )}

          {tagChartData.length > 0 && (
            <Card>
              <h2 className="text-xl font-semibold text-white mb-5">Tag Distribution</h2>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={tagChartData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name }) => name}
                  >
                    {tagChartData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#f1f5f9' }} />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          )}
        </div>

        {analytics.avgResponseTimeMinutes !== undefined && (
          <Card className="mt-8">
            <div className="flex items-center gap-4">
              <Clock className="h-6 w-6 text-indigo-400" />
              <div>
                <p className="text-base text-gray-400">Average Response Time</p>
                <p className="text-2xl font-bold text-white">{analytics.avgResponseTimeMinutes?.toFixed(1)} minutes</p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </PageLayout>
  );
}
