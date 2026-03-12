import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { doubtsApi } from '../api/doubts';
import { tagsApi } from '../api/misc';
import PageLayout from '../components/layout/PageLayout';
import DoubtList from '../components/doubt/DoubtList';
import Pagination from '../components/common/Pagination';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { TrendingUp, Flame, Clock, Sparkles } from 'lucide-react';

export default function Home() {
  const [doubts, setDoubts] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('latest');
  const [trendingTags, setTrendingTags] = useState([]);
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('q');

  useEffect(() => {
    loadDoubts();
  }, [page, filter, searchQuery]);

  useEffect(() => {
    tagsApi.getTrending(8).then(res => setTrendingTags(res.data)).catch(() => {});
  }, []);

  const loadDoubts = async () => {
    setLoading(true);
    try {
      let res;
      if (searchQuery) {
        res = await doubtsApi.search(searchQuery, page, 10);
      } else if (filter === 'open') {
        res = await doubtsApi.getByStatus('OPEN', page, 10);
      } else if (filter === 'answered') {
        res = await doubtsApi.getByStatus('ANSWERED', page, 10);
      } else {
        res = await doubtsApi.getAll(page, 10);
      }
      setDoubts(res.data.content || []);
      setTotalPages(res.data.totalPages || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filters = [
    { key: 'latest', label: 'Latest', icon: Clock },
    { key: 'open', label: 'Open', icon: Flame },
    { key: 'answered', label: 'Answered', icon: TrendingUp },
  ];

  return (
    <PageLayout>
      {/* Header */}
      {searchQuery ? (
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">
            Search results for "<span className="text-indigo-400">{searchQuery}</span>"
          </h1>
        </div>
      ) : (
        <div className="mb-10 relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900/40 via-purple-900/20 to-gray-900 border border-indigo-500/20 p-8 sm:p-12 shadow-2xl">
          <div className="relative z-10 max-w-3xl">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-4 tracking-tight">
              Master Your Code with <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">DevResolve</span> Community
            </h1>
            <p className="text-gray-300 text-lg sm:text-xl mb-8 leading-relaxed">
              Get stuck? Ask questions, share knowledge, and collaborate in real-time. Join thousands of developers building their reputation.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <Link to="/ask">
                <Button size="lg" className="shadow-lg shadow-indigo-500/25" icon={<Sparkles className="h-5 w-5" />}>
                  Ask a Doubt
                </Button>
              </Link>
              <Link to="/leaderboard">
                <Button variant="outline" size="lg">Top Developers</Button>
              </Link>
            </div>
          </div>
          {/* Decorative blur elements for modern UI */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-indigo-600/20 blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 right-1/4 -mb-20 w-72 h-72 rounded-full bg-purple-600/10 blur-3xl pointer-events-none"></div>
        </div>
      )}

      {/* Trending tags */}
      {trendingTags.length > 0 && !searchQuery && (
        <div className="flex flex-wrap gap-2.5 mb-8">
          <span className="text-sm text-gray-500 mr-1 self-center">Trending:</span>
          {trendingTags.map((tag) => (
            <Badge key={tag.name || tag.id} color="indigo" size="sm" className="cursor-pointer hover:opacity-80">
              {tag.name}
            </Badge>
          ))}
        </div>
      )}

      {/* Filters */}
      {!searchQuery && (
        <div className="flex items-center gap-3 mb-8">
          {filters.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => { setFilter(key); setPage(0); }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[15px] font-medium transition-all
                ${filter === key
                  ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/30'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200 border border-transparent'}`}
            >
              <Icon className="h-5 w-5" />
              {label}
            </button>
          ))}
        </div>
      )}

      <DoubtList doubts={doubts} loading={loading} emptyMessage={searchQuery ? 'No results found.' : 'No doubts yet. Be the first to ask!'} />
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </PageLayout>
  );
}
