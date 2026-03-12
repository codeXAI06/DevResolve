import { useEffect, useState } from 'react';
import { rewardsApi } from '../api/misc';
import { useAuthStore } from '../store/authStore';
import PageLayout from '../components/layout/PageLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import { Gift, Coins } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Rewards() {
  const { user } = useAuthStore();
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [redeeming, setRedeeming] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await rewardsApi.getAvailable();
        setRewards(data || []);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleRedeem = async (rewardId) => {
    setRedeeming(rewardId);
    try {
      await rewardsApi.redeem(rewardId);
      toast.success('Reward redeemed!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to redeem');
    } finally {
      setRedeeming(null);
    }
  };

  return (
    <PageLayout>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Gift className="h-7 w-7 text-indigo-400" /> Rewards
          </h1>
          <p className="text-gray-400 text-base mt-2">Redeem your points for rewards</p>
        </div>
        <div className="flex items-center gap-2.5 bg-gray-900 border border-gray-700 rounded-xl px-5 py-3">
          <Coins className="h-6 w-6 text-yellow-400" />
          <span className="text-xl font-bold text-white">{user?.reputationPoints || 0}</span>
          <span className="text-base text-gray-400">points</span>
        </div>
      </div>

      {loading ? (
        <Spinner className="py-16" />
      ) : rewards.length === 0 ? (
        <p className="text-center text-gray-500 py-16">No rewards available yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {rewards.map((reward) => (
            <Card key={reward.id}>
              {reward.imageUrl && (
                <img src={reward.imageUrl} alt={reward.name} className="w-full h-40 object-cover rounded-xl mb-4" />
              )}
              <h3 className="text-xl font-semibold text-white">{reward.name}</h3>
              <p className="text-base text-gray-400 mt-1.5 mb-5">{reward.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-base font-semibold text-yellow-400">{reward.pointsCost} points</span>
                <Button
                  size="sm"
                  disabled={(user?.reputationPoints || 0) < reward.pointsCost}
                  loading={redeeming === reward.id}
                  onClick={() => handleRedeem(reward.id)}
                >
                  Redeem
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </PageLayout>
  );
}
