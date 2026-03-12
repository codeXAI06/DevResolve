import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { usersApi } from '../api/misc';
import { doubtsApi } from '../api/doubts';
import PageLayout from '../components/layout/PageLayout';
import DoubtList from '../components/doubt/DoubtList';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Spinner from '../components/ui/Spinner';
import { Award, MessageCircle, CheckCircle2, TrendingUp, Star } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuthStore();
  const [profile, setProfile] = useState(null);
  const [myDoubts, setMyDoubts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [profRes, doubtsRes] = await Promise.all([
          usersApi.getDashboard(user.id),
          doubtsApi.getByUser(user.id, 0, 5),
        ]);
        setProfile(profRes.data);
        setMyDoubts(doubtsRes.data.content || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (user?.id) load();
  }, [user]);

  if (loading) return <PageLayout><Spinner className="py-20" /></PageLayout>;

  const stats = [
    { label: 'Reputation', value: profile?.reputationPoints ?? user?.reputationPoints ?? 0, icon: Award, color: 'text-yellow-400' },
    { label: 'Doubts Asked', value: profile?.totalDoubts ?? 0, icon: MessageCircle, color: 'text-blue-400' },
    { label: 'Answers Given', value: profile?.totalAnswers ?? 0, icon: CheckCircle2, color: 'text-green-400' },
    { label: 'Accepted', value: profile?.acceptedAnswers ?? 0, icon: Star, color: 'text-indigo-400' },
  ];

  return (
    <PageLayout>
      <div className="animate-fade-in">
        <h1 className="text-3xl font-bold text-white mb-8">Dashboard</h1>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          {stats.map(({ label, value, icon: Icon, color }) => (
            <Card key={label}>
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl bg-gray-800 ${color}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-white">{value}</p>
                  <p className="text-sm text-gray-500">{label}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Skill Tags */}
        {profile?.skillTags?.length > 0 && (
          <Card className="mb-10">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-indigo-400" /> Your Skill Tags
            </h2>
            <div className="flex flex-wrap gap-2.5">
              {profile.skillTags.map((st) => (
                <Badge key={st.tagName} color="indigo" size="md">
                  {st.tagName} — {st.proficiencyScore?.toFixed(0)}%
                </Badge>
              ))}
            </div>
          </Card>
        )}

        {/* Recent Doubts */}
        <div>
          <h2 className="text-xl font-semibold text-white mb-5">Your Recent Doubts</h2>
          <DoubtList doubts={myDoubts} loading={false} emptyMessage="You haven't asked any doubts yet." />
        </div>
      </div>
    </PageLayout>
  );
}
