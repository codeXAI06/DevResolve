import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { doubtsApi } from '../api/doubts';
import { tagsApi } from '../api/misc';
import PageLayout from '../components/layout/PageLayout';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Card from '../components/ui/Card';
import { X, Sparkles, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AskDoubt() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: '', description: '', codeSnippet: '', tags: [] });
  const [tagInput, setTagInput] = useState('');
  const [tagSuggestions, setTagSuggestions] = useState([]);
  const [similarDoubts, setSimilarDoubts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [checkingSimilar, setCheckingSimilar] = useState(false);

  // Check similar doubts when title changes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (form.title.length >= 15) {
        checkSimilar();
      } else {
        setSimilarDoubts([]);
      }
    }, 800);
    return () => clearTimeout(timer);
  }, [form.title]);

  // Tag search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (tagInput.length >= 2) {
        tagsApi.search(tagInput).then(res => setTagSuggestions(res.data || [])).catch(() => {});
      } else {
        setTagSuggestions([]);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [tagInput]);

  const checkSimilar = async () => {
    setCheckingSimilar(true);
    try {
      const { data } = await doubtsApi.findSimilar(form.title);
      setSimilarDoubts(data || []);
    } catch {
      // Ignore
    } finally {
      setCheckingSimilar(false);
    }
  };

  const addTag = (tagName) => {
    const name = tagName.toLowerCase().trim();
    if (name && !form.tags.includes(name) && form.tags.length < 5) {
      setForm({ ...form, tags: [...form.tags, name] });
    }
    setTagInput('');
    setTagSuggestions([]);
  };

  const removeTag = (tag) => {
    setForm({ ...form, tags: form.tags.filter((t) => t !== tag) });
  };

  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(tagInput);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.title.length < 10) return toast.error('Title must be at least 10 characters');
    if (form.description.length < 20) return toast.error('Description must be at least 20 characters');
    setLoading(true);
    try {
      const { data } = await doubtsApi.create({
        title: form.title,
        description: form.description,
        codeSnippet: form.codeSnippet || undefined,
        tags: form.tags,
      });
      toast.success('Doubt posted!');
      navigate(`/doubts/${data.id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to post doubt');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageLayout>
      <div className="max-w-4xl mx-auto animate-fade-in">
        <h1 className="text-3xl font-bold text-white mb-3">Ask a Doubt</h1>
        <p className="text-gray-400 text-lg mb-8">Describe your problem clearly for the best answers</p>

        {/* Similar Doubts Warning */}
        {similarDoubts.length > 0 && (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-5 mb-8">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-5 w-5 text-yellow-400" />
              <h3 className="font-medium text-yellow-300">Similar doubts already exist</h3>
            </div>
            <ul className="space-y-1">
              {similarDoubts.slice(0, 3).map((d) => (
                <li key={d.id}>
                  <a href={`/doubts/${d.id}`} target="_blank" rel="noreferrer" className="text-sm text-yellow-200 hover:text-yellow-100 underline">
                    {d.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Title */}
          <div>
            <Input
              label="Title"
              placeholder="e.g., How to handle async errors in Express middleware?"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
            {checkingSimilar && <p className="text-xs text-indigo-400 mt-1 flex items-center gap-1"><Sparkles className="h-3 w-3" />Checking for similar doubts...</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2.5">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Describe your doubt in detail. Markdown is supported..."
              rows={8}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-5 py-4 text-base text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-y min-h-[180px]"
            />
          </div>

          {/* Code Snippet */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2.5">Code Snippet (optional)</label>
            <textarea
              value={form.codeSnippet}
              onChange={(e) => setForm({ ...form, codeSnippet: e.target.value })}
              placeholder="Paste relevant code here..."
              rows={6}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-5 py-4 text-base text-gray-100 font-mono placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-y"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2.5">Tags (up to 5)</label>
            <div className="flex flex-wrap items-center gap-3 mb-4">
              {form.tags.map((tag) => (
                <Badge key={tag} color="indigo">
                  {tag}
                  <button type="button" onClick={() => removeTag(tag)} className="ml-1 hover:text-white">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="relative">
              <input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                placeholder="Type a tag and press Enter..."
                disabled={form.tags.length >= 5}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-5 py-3.5 text-base text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              {tagSuggestions.length > 0 && (
                <div className="absolute top-full mt-2 w-full bg-gray-900 border border-gray-700 rounded-xl shadow-xl z-10 py-2 max-h-48 overflow-y-auto">
                  {tagSuggestions.map((t) => (
                    <button
                      key={t.id || t.name}
                      type="button"
                      onClick={() => addTag(t.name)}
                      className="w-full text-left px-5 py-2.5 text-sm text-gray-300 hover:bg-gray-800 hover:text-white"
                    >
                      {t.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-6 border-t border-gray-800">
            <Button variant="ghost" type="button" onClick={() => navigate(-1)}>Cancel</Button>
            <Button type="submit" loading={loading}>Post Doubt</Button>
          </div>
        </form>
      </div>
    </PageLayout>
  );
}
