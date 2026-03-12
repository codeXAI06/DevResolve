import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { usersApi } from '../api/misc';
import PageLayout from '../components/layout/PageLayout';
import Avatar from '../components/ui/Avatar';
import Badge from '../components/ui/Badge';
import Card from '../components/ui/Card';
import Spinner from '../components/ui/Spinner';
import { Award, MessageCircle, CheckCircle2, Calendar } from 'lucide-react';

export default function Profile() {
  const { username } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await usersApi.getProfile(username);
        setProfile(data);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [username]);

  if (loading) return <PageLayout><Spinner className="py-20" /></PageLayout>;
  if (!profile) return <PageLayout><p className="text-gray-400 text-center py-20">User not found.</p></PageLayout>;

  return (
    <PageLayout>
      <div className="max-w-4xl mx-auto animate-fade-in">
        <Card className="mb-8">
          <div className="flex items-center gap-6">
            <Avatar username={profile.username} avatarUrl={profile.avatarUrl} size="lg" />
            <div>
              <h1 className="text-2xl font-bold text-white">{profile.username}</h1>
              {profile.bio && <p className="text-base text-gray-400 mt-1.5">{profile.bio}</p>}
              <div className="flex items-center gap-5 mt-3 text-base text-gray-500">
                <span className="flex items-center gap-1.5"><Award className="h-5 w-5 text-yellow-400" />{profile.reputationPoints} points</span>
                <span className="flex items-center gap-1.5"><Calendar className="h-5 w-5" />Joined {new Date(profile.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-3 gap-5 mb-8">
          <Card>
            <div className="text-center">
              <MessageCircle className="h-6 w-6 text-blue-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{profile.totalDoubts ?? 0}</p>
              <p className="text-sm text-gray-500">Doubts</p>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <CheckCircle2 className="h-6 w-6 text-green-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{profile.totalAnswers ?? 0}</p>
              <p className="text-sm text-gray-500">Answers</p>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <Award className="h-6 w-6 text-yellow-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{profile.acceptedAnswers ?? 0}</p>
              <p className="text-sm text-gray-500">Accepted</p>
            </div>
          </Card>
        </div>

        {profile.skillTags?.length > 0 && (
          <Card>
            <h2 className="text-xl font-semibold text-white mb-4">Skills</h2>
            <div className="flex flex-wrap gap-2.5">
              {profile.skillTags.map((st) => (
                <Badge key={st.tagName} color="indigo" size="md">
                  {st.tagName}
                </Badge>
              ))}
            </div>
          </Card>
        )}
      </div>
    </PageLayout>
  );
}
