import { useEffect, useState } from 'react';
import { tagsApi } from '../api/misc';
import PageLayout from '../components/layout/PageLayout';
import Badge from '../components/ui/Badge';
import Spinner from '../components/ui/Spinner';
import { Tag as TagIcon, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Tags() {
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = search.length >= 2
          ? await tagsApi.search(search)
          : await tagsApi.getAll();
        setTags(data || []);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    setLoading(true);
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [search]);

  return (
    <PageLayout>
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3"><TagIcon className="h-7 w-7 text-indigo-500" /> Tags</h1>
          <p className="text-gray-400 text-base mt-2">Browse topics by tag</p>
        </div>
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tags..."
            className="w-full bg-gray-800 border border-gray-700 rounded-xl pl-11 pr-5 py-3 text-base text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {loading ? (
        <Spinner className="py-16" />
      ) : tags.length === 0 ? (
        <p className="text-center text-gray-500 py-16">No tags found.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {tags.map((tag) => (
            <div
              key={tag.id || tag.name}
              onClick={() => navigate(`/doubts?tag=${tag.name}`)}
              className="bg-gray-900 border border-gray-800 rounded-2xl p-5 hover:border-indigo-500/50 cursor-pointer transition-all hover:shadow-lg hover:shadow-indigo-500/5"
            >
              <Badge color="indigo" size="md">{tag.name}</Badge>
              <p className="text-sm text-gray-500 mt-3">{tag.usageCount || 0} doubts</p>
              {tag.description && <p className="text-sm text-gray-400 mt-1.5 line-clamp-2">{tag.description}</p>}
            </div>
          ))}
        </div>
      )}
    </PageLayout>
  );
}
